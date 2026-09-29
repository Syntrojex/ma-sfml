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

## Quick Start

Install globally:

    npm install -g ma-sfml

Navigate to your C++ project and run:

    ma-sfml

`ma-sfml` detects your IDE, locates or downloads SFML, and configures the project for your compiler.

For empty folders, it can also scaffold a starter project.

## Features

- **IDE Detection** — Supports VS Code and Visual Studio Community.
- **Compiler Compatibility** — Configures SFML for MinGW or MSVC.
- **Automatic Downloads** — Retrieves SFML when a suitable installation isn't available.
- **Project Configuration** — Sets up required paths and supporting files.
- **Project Scaffolding** — Creates a starter project in an empty directory.

## Commands

| Command | Description |
|---|---|
| `ma-sfml` | Set up SFML in the current project |
| `ma-sfml link` | Configure SFML for the project |
| `ma-sfml download` | Download an SFML version |
| `ma-sfml check` | Check the current project's SFML setup |
| `ma-sfml remove` | Remove ma-sfml configuration files |
| `ma-sfml -h` | Display help |
| `ma-sfml -v` | Display version |

## Requirements

- Windows
- Node.js 16 or later
- **VS Code:** MinGW-w64 with `g++` available on PATH
- **Visual Studio Community:** MSVC and the Desktop development with C++ workload

## Issues

Found a bug or have a feature request? Check existing issues first, then open a new one with relevant details and error output.

[**Report an Issue →**](https://github.com/Syntrojex/ma-sfml/issues/new)

## Contributing

Contributions and pull requests are welcome. For significant changes, open an issue first to discuss your proposal.

## License

MIT © Muhammad Mustafa Amir

<div align="center">

Built by [Syntrojex](https://github.com/Syntrojex) · Part of [Nethric Technologies](https://github.com/Nethric-Technologies)

</div>
