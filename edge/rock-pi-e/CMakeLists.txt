cmake_minimum_required(VERSION 3.20)
project(gridex_rock_pi_e LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(gridex_suntech_driver
  src/suntech_ste261l.cpp
)
target_include_directories(gridex_suntech_driver PUBLIC include)
target_compile_options(gridex_suntech_driver PRIVATE -Wall -Wextra -Wpedantic)

enable_testing()
add_executable(suntech_ste261l_test tests/suntech_ste261l_test.cpp)
target_link_libraries(suntech_ste261l_test PRIVATE gridex_suntech_driver)
target_compile_options(suntech_ste261l_test PRIVATE -Wall -Wextra -Wpedantic)
add_test(NAME suntech_ste261l_test COMMAND suntech_ste261l_test)

