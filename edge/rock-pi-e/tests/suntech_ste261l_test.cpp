#include "gridex/suntech_ste261l.hpp"

#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <map>
#include <stdexcept>
#include <utility>
#include <vector>

namespace {

class FakeModbus final : public gridex::ModbusClient {
 public:
  bool fault{};
  std::map<std::uint16_t, std::uint16_t> holding{
      {5001, 0}, {5002, 1}, {5003, 1}};
  std::vector<std::pair<std::uint16_t, std::uint16_t>> writes;
  std::uint16_t lastInputAddress{};
  std::uint16_t lastInputCount{};
  std::vector<std::uint16_t> accumulated{0x0001, 0xE240, 0x0000, 0x03E8};
  std::vector<std::uint16_t> daily{120, 80};
  std::uint16_t soc{720};
  std::vector<std::uint16_t> limits{500, 600};

  bool readCoil(std::uint16_t) override { return fault; }

  std::uint16_t readHolding(std::uint16_t address) override {
    return holding.at(address);
  }

  std::vector<std::uint16_t> readInput(std::uint16_t address,
                                       std::uint16_t count) override {
    lastInputAddress = address;
    lastInputCount = count;
    if (address == 122 && count == 4) return accumulated;
    if (address == 129 && count == 2) return daily;
    if (address == 102 && count == 1) return {soc};
    if (address == 127 && count == 2) return limits;
    return {};
  }

  void writeSingle(std::uint16_t address, std::uint16_t value) override {
    writes.emplace_back(address, value);
  }
};

bool near(double left, double right) {
  return std::abs(left - right) < 0.0001;
}

}  // namespace

int main() {
  FakeModbus client;
  gridex::SuntechSte261l driver(client);

  assert(gridex::SuntechSte261l::decodeInt32Abcd(0x0001, 0xE240) == 123456);
  assert(gridex::SuntechSte261l::decodeInt32Abcd(0xFFFF, 0xFC18) == -1000);
  assert(near(gridex::SuntechSte261l::decodeScaledInt32(0xFFFF, 0xFC18), -100.0));

  const auto energy = driver.readAccumulatedEnergy();
  assert(client.lastInputAddress == 122);
  assert(client.lastInputCount == 4);
  assert(near(energy.accumulatedChargeKwh, 12345.6));
  assert(near(energy.accumulatedDischargeKwh, 100.0));

  const auto daily = driver.readDailyEnergy();
  assert(near(daily.chargeKwh, 12.0));
  assert(near(daily.dischargeKwh, 8.0));

  driver.enableHeartbeat();
  assert(client.writes[0].first == 5302 && client.writes[0].second == 1);
  assert(client.writes[1].first == 5301 && client.writes[1].second == 60);

  const auto start = gridex::SuntechSte261l::Clock::now();
  const auto discharge = driver.writeActivePowerKw(100.0, start);
  assert(near(discharge, 60.0));
  assert(client.writes.back().first == 5005 && client.writes.back().second == 600);

  bool rateLimited = false;
  try {
    driver.writeActivePowerKw(10.0, start + std::chrono::milliseconds(500));
  } catch (const std::runtime_error&) {
    rateLimited = true;
  }
  assert(rateLimited);

  const auto charge = driver.writeActivePowerKw(-100.0, start + std::chrono::seconds(1));
  assert(near(charge, -50.0));
  assert(client.writes.back().first == 5005);
  assert(static_cast<std::int16_t>(client.writes.back().second) == -500);

  client.soc = 960;
  const auto blockedCharge = driver.writeActivePowerKw(-20.0, start + std::chrono::seconds(2));
  assert(near(blockedCharge, 0.0));
  assert(client.writes.back().first == 5005 && client.writes.back().second == 0);

  client.fault = true;
  const auto faulted = driver.writeActivePowerKw(20.0, start + std::chrono::seconds(3));
  assert(near(faulted, 0.0));
  assert(client.writes.back().first == 5005 && client.writes.back().second == 0);

  client.accumulated.pop_back();
  bool incompleteReadRejected = false;
  try {
    driver.readAccumulatedEnergy();
  } catch (const std::runtime_error&) {
    incompleteReadRejected = true;
  }
  assert(incompleteReadRejected);
  assert(client.writes.back().first == 5005 && client.writes.back().second == 0);
}
