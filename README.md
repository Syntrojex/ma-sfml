<div align="center">

# ma-sfml

**Zero-config SFML setup for Windows C++ developers.**  
Auto-detects your IDE, finds or downloads SFML, and links everything — one command, no manual include paths, no linker errors.

![npm version](https://img.shields.io/npm/v/ma-sfml?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)
![npm downloads](https://img.shields.io/npm/dt/ma-sfml?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)
![platform](https://img.shields.io/badge/PLATFORM-WINDOWS-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![license](https://img.shields.io/badge/LICENSE-MIT-yellow?style=for-the-badge)
![C++](https://img.shields.io/badge/C%2B%2B-SFML-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)

</div>

---

## The problem

Setting up SFML on Windows manually means downloading the right build for your compiler, wiring up include/lib paths, configuring your build system, and making sure the required DLLs are available next to your executable.

One wrong path or mismatched compiler build can leave you staring at linker errors with no idea why.

## The fix

**Install globally:**

    npm install -g ma-sfml

**Then, inside any C++ project folder:**

    ma-sfml

That's it.

`ma-sfml` handles the setup for you:

- **Detects your IDE** — VS Code or Visual Studio Community
- **Finds SFML on your PC** before downloading anything
- **Downloads SFML automatically** when it isn't already available
- **Chooses a compiler-compatible Windows build** for the detected IDE
- **Configures your project** with the required SFML include and library paths
- **Handles DLL setup** for the generated/configured project
- **Generates a starter project** when run inside an empty folder

No manual include paths.  
No manual library paths.  
No Stack Overflow archaeology.

---

## Quick start

    npm install -g ma-sfml

    cd YourProject
    ma-sfml

Example output:

    ✓ SFML 3.1.0 ready
    ✓ IDE detected — VS Code
    ✓ Linking complete

    .vscode/tasks.json
    .vscode/launch.json
    .vscode/c_cpp_properties.json
    src/main.cpp

    Open this folder in VS Code.
    Build: Ctrl + Shift + B
    Run: F5

Works with both existing projects and empty folders.

If the folder is empty, `ma-sfml` can offer to scaffold a new SFML project and lets you choose between:

- VS Code
- Visual Studio Community

You can also provide a custom project name during the setup.

---

## Commands

| Command | What it does |
|---|---|
| `ma-sfml` / `ma-sfml link` | Detect the IDE, find or download SFML, and link it to the current project |
| `ma-sfml download` | Download a specific SFML version without linking it to a project |
| `ma-sfml check` | Check whether SFML is linked in the current project |
| `ma-sfml remove` | Remove ma-sfml configuration files without removing your source code or SFML installation |
| `ma-sfml -h` | Show help |
| `ma-sfml -v` | Show the installed ma-sfml version |

---

## Supported setups

| | VS Code | Visual Studio Community |
|---|:---:|:---:|
| Compiler | MinGW-w64 | MSVC |
| Compiler executable | `g++` | `cl.exe` |
| IDE detection | `.vscode/`, `.cpp` / `.h` files | `.sln`, `.slnx`, `.vcxproj` |
| Debugger | GDB | Native Visual Studio debugger |
| SFML build | MinGW-compatible Windows build | MSVC-compatible Windows build |
| DLL setup | Automatic | Automatic |

### VS Code

For VS Code projects, `ma-sfml` is designed around a MinGW-w64 toolchain with `g++` available on your PATH.

It can configure the VS Code project files required for building, debugging, and C++ IntelliSense.

### Visual Studio Community

For Visual Studio Community, `ma-sfml` detects Visual Studio projects using solution/project files such as:

- `.sln`
- `.slnx`
- `.vcxproj`

It then uses an MSVC-compatible SFML Windows build.

---

## Automatic SFML downloads

When SFML is not already available on your system, `ma-sfml` can retrieve available SFML releases and present them for selection.

Example:

    Available versions:

      1  SFML 3.1.0  (latest)
      2  SFML 3.0.2
      3  SFML 3.0.1

    Select a version:

The tool then selects an appropriate Windows ZIP asset for the detected IDE/compiler.

For VS Code / MinGW environments, it looks for MinGW/GCC-compatible builds.

For Visual Studio environments, it looks for MSVC-compatible builds such as VC17 64-bit releases.

SFML is downloaded from its official GitHub releases.

---

## Existing SFML installations

`ma-sfml` does not blindly download SFML every time.

It first checks whether a suitable SFML installation or downloaded archive is already available.

If a compatible installation is found, it can reuse it instead of downloading another copy.

This keeps setup faster and avoids unnecessary downloads.

---

## Project scaffolding

Running `ma-sfml` in an empty directory gives you the option to create a new SFML project.

Example:

    This folder is empty.

    Create a new SFML project here? (y/n)

You can then choose the IDE:

    Choose an IDE:

      1  VS Code
      2  Visual Studio Community

And optionally provide a project name.

This makes `ma-sfml` useful not only for existing projects, but also for starting a new SFML project from scratch.

---

## Why not just do it manually?

You can — and SFML's own documentation is valuable for understanding how the library works.

`ma-sfml` exists for the common case where you simply want to start a project and begin writing C++ code without spending the first 30 minutes configuring paths and build files.

It is a **setup and productivity tool**, not a replacement for understanding your compiler, linker, or build system.

---

## Requirements

- Windows
- Node.js `>= 16`
- A C++ compiler

### VS Code

- MinGW-w64
- `g++` available on your PATH
- A MinGW-w64 distribution such as [WinLibs](https://winlibs.com/) can be used

### Visual Studio Community

- Visual Studio Community
- Desktop development with C++ workload
- MSVC C++ toolchain

---

## How it works

At a high level, `ma-sfml` follows this process:

    ma-sfml
       │
       ▼
    Detect project / IDE
       │
       ├── VS Code ────────► MinGW
       │
       └── Visual Studio ──► MSVC
                              │
                              ▼
                       Find SFML locally
                              │
                    ┌─────────┴─────────┐
                    │                   │
                  Found             Not found
                    │                   │
                    │             Download release
                    │                   │
                    │             Extract SFML
                    │                   │
                    └─────────┬─────────┘
                              ▼
                       Configure project
                              │
                              ▼
                        Ready to build

---

## Contributing

Issues and pull requests are welcome.

This is a small, focused tool. If you encounter a case it does not handle — such as a new SFML release format, an unusual project layout, or an unsupported compiler configuration — open an issue with:

- Your project structure
- Your IDE
- Your compiler
- The SFML version
- The command you ran
- The error/output you received

This makes it easier to reproduce and fix the problem.

---

## License

MIT © Muhammad Mustafa Amir

<div align="center">

Built by Muhammad Mustafa ([@Syntrojex](https://github.com/Syntrojex))  
Part of the [Nethric Technologies](https://github.com/Nethric-Technologies) toolset

</div>
