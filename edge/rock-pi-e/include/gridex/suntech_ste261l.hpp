#pragma once

#include "gridex/modbus_client.hpp"

#include <chrono>
#include <cstddef>
#include <cstdint>

namespace gridex {

struct SuntechConfig {
  std::uint16_t port{3200};
  std::uint8_t unitId{1};
  std::chrono::milliseconds pollInterval{750};
  std::chrono::seconds requestTimeout{4};
  std::chrono::seconds heartbeatTimeout{60};
  std::chrono::seconds heartbeatRefresh{35};
  std::chrono::seconds minimumCommandInterval{1};
  double minimumSocPct{10.0};
  double maximumSocPct{95.0};
  double ratedPowerKw{125.0};
};

struct EnergyCounters {
  double accumulatedChargeKwh{};
  double accumulatedDischargeKwh{};
};

struct DailyEnergyCounters {
  double chargeKwh{};
  double dischargeKwh{};
};

struct SafetySnapshot {
  bool overallFault{};
  bool poweredOn{};
  bool gridTied{};
  bool currentSourceMode{};
  double socPct{};
  double maxChargeKw{};
  double maxDischargeKw{};
};

class SuntechSte261l {
 public:
  using Clock = std::chrono::steady_clock;

  explicit SuntechSte261l(ModbusClient& client, SuntechConfig config = {});

  static std::int32_t decodeInt32Abcd(std::uint16_t highWord,
                                      std::uint16_t lowWord);
  static double decodeScaledInt32(std::uint16_t highWord,
                                  std::uint16_t lowWord);

  EnergyCounters readAccumulatedEnergy();
  DailyEnergyCounters readDailyEnergy();
  SafetySnapshot readSafetySnapshot();

  void enableHeartbeat();
  void refreshHeartbeat();
  void writeSafeZero();
  double writeActivePowerKw(double requestedKw,
                            Clock::time_point now = Clock::now());

 private:
  static constexpr std::uint16_t kSocRegister = 102;
  static constexpr std::uint16_t kAccumulatedEnergyStart = 122;
  static constexpr std::uint16_t kBmsLimitStart = 127;
  static constexpr std::uint16_t kDailyEnergyStart = 129;
  static constexpr std::uint16_t kGridModeRegister = 5001;
  static constexpr std::uint16_t kWorkModeRegister = 5002;
  static constexpr std::uint16_t kPowerOnRegister = 5003;
  static constexpr std::uint16_t kActivePowerRegister = 5005;
  static constexpr std::uint16_t kHeartbeatTimeRegister = 5301;
  static constexpr std::uint16_t kHeartbeatEnableRegister = 5302;
  static constexpr std::uint16_t kOverallFaultCoil = 1;

  static std::uint16_t encodeSignedInt16(double engineeringValue);
  double clampPower(double requestedKw, const SafetySnapshot& snapshot) const;
  void requireRegisterCount(const std::vector<std::uint16_t>& values,
                            std::size_t expected);

  ModbusClient& client_;
  SuntechConfig config_;
  Clock::time_point lastPowerCommand_{};
  bool hasPowerCommand_{false};
};

}  // namespace gridex
