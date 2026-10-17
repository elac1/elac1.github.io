cmake_minimum_required(VERSION 3.8)
project(sky_rover)

find_package(ament_cmake REQUIRED)

# 这个包只有模型和 launch 文件，没有可执行代码。
# install(DIRECTORY) 会递归复制整个目录，所以 urdf/ 下面再分多少层子目录
# 都不用改这里 —— 以后加零件、加传感器也不用动构建配置。
install(
  DIRECTORY urdf launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()