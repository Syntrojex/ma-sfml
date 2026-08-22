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
