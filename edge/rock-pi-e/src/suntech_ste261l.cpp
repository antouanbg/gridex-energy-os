#include "gridex/suntech_ste261l.hpp"

#include <algorithm>
#include <cmath>
#include <limits>
#include <stdexcept>

namespace gridex {

SuntechSte261l::SuntechSte261l(ModbusClient& client, SuntechConfig config)
    : client_(client), config_(config) {
  if (config_.minimumSocPct < 0.0 ||
      config_.maximumSocPct > 100.0 ||
      config_.minimumSocPct >= config_.maximumSocPct) {
    throw std::invalid_argument("Invalid Suntech SOC safety envelope");
  }
  if (config_.ratedPowerKw <= 0.0 || config_.ratedPowerKw > 125.0) {
    throw std::invalid_argument("STE-261L rated power must be within 0-125 kW");
  }
}

std::int32_t SuntechSte261l::decodeInt32Abcd(std::uint16_t highWord,
                                             std::uint16_t lowWord) {
  const auto raw = (static_cast<std::uint32_t>(highWord) << 16U) |
                   static_cast<std::uint32_t>(lowWord);
  return static_cast<std::int32_t>(raw);
}

double SuntechSte261l::decodeScaledInt32(std::uint16_t highWord,
                                         std::uint16_t lowWord) {
  return static_cast<double>(decodeInt32Abcd(highWord, lowWord)) / 10.0;
}

EnergyCounters SuntechSte261l::readAccumulatedEnergy() {
  // Manufacturer requirement: registers 122-125 are one atomic FC04 request.
  const auto values = client_.readInput(kAccumulatedEnergyStart, 4);
  requireRegisterCount(values, 4);
  return {
      .accumulatedChargeKwh = decodeScaledInt32(values[0], values[1]),
      .accumulatedDischargeKwh = decodeScaledInt32(values[2], values[3]),
  };
}

DailyEnergyCounters SuntechSte261l::readDailyEnergy() {
  const auto values = client_.readInput(kDailyEnergyStart, 2);
  requireRegisterCount(values, 2);
  return {
      .chargeKwh = static_cast<double>(static_cast<std::int16_t>(values[0])) / 10.0,
      .dischargeKwh = static_cast<double>(static_cast<std::int16_t>(values[1])) / 10.0,
  };
}

SafetySnapshot SuntechSte261l::readSafetySnapshot() {
  const auto soc = client_.readInput(kSocRegister, 1);
  const auto limits = client_.readInput(kBmsLimitStart, 2);
  requireRegisterCount(soc, 1);
  requireRegisterCount(limits, 2);
  return {
      .overallFault = client_.readCoil(kOverallFaultCoil),
      .poweredOn = client_.readHolding(kPowerOnRegister) == 1,
      .gridTied = client_.readHolding(kGridModeRegister) == 0,
      .currentSourceMode = client_.readHolding(kWorkModeRegister) == 1,
      .socPct = static_cast<double>(static_cast<std::int16_t>(soc[0])) / 10.0,
      .maxChargeKw = static_cast<double>(limits[0]) / 10.0,
      .maxDischargeKw = static_cast<double>(limits[1]) / 10.0,
  };
}

void SuntechSte261l::enableHeartbeat() {
  client_.writeSingle(kHeartbeatEnableRegister, 1);
  client_.writeSingle(kHeartbeatTimeRegister,
                      static_cast<std::uint16_t>(config_.heartbeatTimeout.count()));
}

void SuntechSte261l::refreshHeartbeat() {
  client_.writeSingle(kHeartbeatTimeRegister,
                      static_cast<std::uint16_t>(config_.heartbeatTimeout.count()));
}

void SuntechSte261l::writeSafeZero() {
  client_.writeSingle(kActivePowerRegister, 0);
  hasPowerCommand_ = false;
}

double SuntechSte261l::writeActivePowerKw(double requestedKw,
                                           Clock::time_point now) {
  if (requestedKw == 0.0) {
    writeSafeZero();
    return 0.0;
  }
  if (hasPowerCommand_ && now - lastPowerCommand_ < config_.minimumCommandInterval) {
    throw std::runtime_error("Suntech power commands require a one-second interval");
  }

  const auto snapshot = readSafetySnapshot();
  const double appliedKw = clampPower(requestedKw, snapshot);
  client_.writeSingle(kActivePowerRegister, encodeSignedInt16(appliedKw));
  lastPowerCommand_ = now;
  hasPowerCommand_ = true;
  return appliedKw;
}

std::uint16_t SuntechSte261l::encodeSignedInt16(double engineeringValue) {
  const auto scaled = std::llround(engineeringValue * 10.0);
  if (scaled < std::numeric_limits<std::int16_t>::min() ||
      scaled > std::numeric_limits<std::int16_t>::max()) {
    throw std::out_of_range("Suntech power command exceeds signed Int16 range");
  }
  return static_cast<std::uint16_t>(static_cast<std::int16_t>(scaled));
}

double SuntechSte261l::clampPower(double requestedKw,
                                  const SafetySnapshot& snapshot) const {
  if (snapshot.overallFault || !snapshot.poweredOn || !snapshot.gridTied ||
      !snapshot.currentSourceMode) {
    return 0.0;
  }

  if (requestedKw > 0.0) {
    if (snapshot.socPct <= config_.minimumSocPct || snapshot.maxDischargeKw <= 0.0) {
      return 0.0;
    }
    return std::min({requestedKw, snapshot.maxDischargeKw, config_.ratedPowerKw});
  }

  if (snapshot.socPct >= config_.maximumSocPct || snapshot.maxChargeKw <= 0.0) {
    return 0.0;
  }
  return -std::min({std::abs(requestedKw), snapshot.maxChargeKw,
                    config_.ratedPowerKw});
}

void SuntechSte261l::requireRegisterCount(
    const std::vector<std::uint16_t>& values, std::size_t expected) {
  if (values.size() != expected) {
    writeSafeZero();
    throw std::runtime_error("Incomplete Suntech Modbus response");
  }
}

}  // namespace gridex
