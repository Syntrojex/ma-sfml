<div align="center">

# ma-sfml

**Zero-config SFML setup for Windows C++ developers.**

Automatically detect your IDE, find or download SFML, and configure your project — without manually setting up include paths, libraries, or DLLs.

![npm version](https://img.shields.io/npm/v/ma-sfml?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)
![npm downloads](https://img.shields.io/npm/dt/ma-sfml?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)
![Platform](https://img.shields.io/badge/PLATFORM-WINDOWS-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![License](https://img.shields.io/badge/LICENSE-MIT-yellow?style=for-the-badge)

</div>

---

## Overview

Setting up SFML manually on Windows involves downloading the correct compiler-compatible build, configuring include and library paths, and managing runtime DLLs.

`ma-sfml` automates this process through a simple command-line interface, helping you get your C++ project ready to build with less manual configuration.

## Features

- **Automatic IDE Detection** — Detects VS Code and Visual Studio Community project setups.
- **SFML Management** — Finds an existing SFML installation or downloads a selected version when needed.
- **Compiler Compatibility** — Selects an appropriate SFML build for MinGW or MSVC.
- **Project Configuration** — Sets up the required include paths, library paths, and supporting configuration files.
- **DLL Handling** — Automates DLL setup for supported project configurations.
- **Project Scaffolding** — Offers to create a starter SFML project when run in an empty folder.

## Quick Start

Install `ma-sfml` globally using npm:

    npm install -g ma-sfml

Navigate to your C++ project directory:

    cd YourProject

Run the setup command:

    ma-sfml

The tool detects the project environment and guides you through the required SFML setup.

## Supported IDEs

### VS Code

Designed for C++ projects using **MinGW-w64** and `g++`.

- Detects supported VS Code project layouts.
- Configures `.vscode` build, debugging, and IntelliSense files.
- Sets up SFML include and library paths.
- Handles the required runtime DLLs.

**Requirement:** MinGW-w64 with `g++` available on PATH.

### Visual Studio Community

Supports C++ projects using the **MSVC compiler**.

- Detects supported Visual Studio solution and project files.
- Selects an appropriate MSVC-compatible SFML build.
- Configures the project for SFML integration.
- Handles the required runtime DLLs.

**Requirement:** Visual Studio Community with the Desktop development with C++ workload.

## Commands

| Command | Description |
|---|---|
| `ma-sfml` | Run SFML setup in the current project |
| `ma-sfml link` | Configure SFML for the current project |
| `ma-sfml download` | Download a selected SFML version |
| `ma-sfml check` | Check the project's SFML configuration |
| `ma-sfml remove` | Remove ma-sfml configuration files |
| `ma-sfml -h` | Display help |
| `ma-sfml -v` | Display the installed version |

## Requirements

- Windows
- Node.js 16 or later
- A supported C++ development environment:
  - **VS Code:** MinGW-w64 and `g++` on PATH.
  - **Visual Studio Community:** MSVC and the Desktop development with C++ workload.

## Issues

Encountered a bug, setup error, or unexpected behavior? Check existing issues first, then open a new issue with your IDE, compiler, command, and relevant error output.

[**Report an Issue →**](https://github.com/Syntrojex/ma-sfml/issues/new)

## Contributing

Contributions and pull requests are welcome. For significant changes, open an issue first to discuss your proposed improvements.

## License

MIT © Muhammad Mustafa Amir

<div align="center">

Built by [Syntrojex](https://github.com/Syntrojex)
