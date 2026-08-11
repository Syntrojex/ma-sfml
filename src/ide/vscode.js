'use strict';
const fs   = require('fs');
const path = require('path');

const MAIN_CPP_SFML3 = [
  '#include <SFML/Graphics.hpp>',
  '#include <optional>',
  '',
  'int main() {',
  '    sf::RenderWindow window(sf::VideoMode({800u, 600u}), "SFML Project");',
  '',
  '    while (window.isOpen()) {',
  '        while (const std::optional event = window.pollEvent()) {',
  '            if (event->is<sf::Event::Closed>())',
  '                window.close();',
  '        }',
  '',
  '        window.clear(sf::Color::Black);',
  '        window.display();',
  '    }',
  '    return 0;',
  '}',
].join('\n');

// File-system-safe name for the .exe (spaces removed) — display name stays intact elsewhere
function safeExeName(projectName) {
  return projectName.replace(/[^\w.-]+/g, '') || 'SFMLProject';
}

// tasks.json — build with g++ (MinGW)
// -static-libgcc/-static-libstdc++/-static reduce "missing libstdc++-6.dll /
// libgcc_s_seh-1.dll / libwinpthread-1.dll" runtime errors, which are the
// #1 cause of "it compiled but won't run" reports from beginners.
function tasksJson(sfmlPath, exeName) {
  const inc = sfmlPath.replace(/\\/g, '/') + '/include';
  const lib = sfmlPath.replace(/\\/g, '/') + '/lib';
  return {
    version: '2.0.0',
    tasks: [{
      label: 'Build (ma-sfml)',
      type: 'cppbuild',
      command: 'g++',
      args: [
        '-std=c++17', '-g',
        '${workspaceFolder}/src/*.cpp',
        `-I${inc}`,
        `-L${lib}`,
        '-static-libgcc', '-static-libstdc++', '-static',
        '-lsfml-graphics', '-lsfml-window', '-lsfml-system',
        '-lsfml-audio', '-lsfml-network',
        '-o', `\${workspaceFolder}/${exeName}.exe`,
      ],
      options: { cwd: '${workspaceFolder}' },
      group: { kind: 'build', isDefault: true },
      problemMatcher: ['$gcc'],
      detail: 'Build with g++ (MinGW) and SFML',
    }],
  };
}

// launch.json — MinGW binaries need GDB, NOT the MSVC debugger (cppvsdbg).
// Using cppvsdbg here (the earlier version's bug) fails silently or refuses
// to bind to a MinGW/DWARF binary — "Debug" would look broken to the user.
function launchJson(exeName) {
  return {
    version: '0.2.0',
    configurations: [{
      name: 'Debug (ma-sfml, gdb)',
      type: 'cppdbg',
      request: 'launch',
      program: `\${workspaceFolder}/${exeName}.exe`,
      args: [],
      stopAtEntry: false,
      cwd: '${workspaceFolder}',
      environment: [],
      externalConsole: false,
      MIMode: 'gdb',
      miDebuggerPath: 'gdb',
      setupCommands: [{
        description: 'Enable pretty-printing for gdb',
        text: '-enable-pretty-printing',
        ignoreFailures: true,
      }],
      preLaunchTask: 'Build (ma-sfml)',
    }],
  };
}

// c_cpp_properties.json — IntelliSense
function cppPropertiesJson(sfmlPath) {
  const inc = sfmlPath.replace(/\\/g, '/') + '/include';
  return {
    configurations: [{
      name: 'Win32',
      includePath: ['${workspaceFolder}/**', inc],
      defines: ['UNICODE', '_UNICODE'],
      compilerPath: 'g++',
      cStandard: 'c17',
      cppStandard: 'c++17',
      intelliSenseMode: 'windows-gcc-x64',
    }],
    version: 4,
  };
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

// Copy every DLL from SFML's bin/ folder into the project root — this is
// where g++ -o writes the .exe, so the .exe finds them next to itself with
// no PATH changes needed. Doing this at link-time (not via a VS Code task)
// means it works whether the user runs via F5, terminal, or double-click.
// `previousDlls` (from an earlier manifest) are removed first so relinking
// with a different SFML version doesn't leave stale DLLs behind.
function copySfmlDlls(sfmlPath, projectDir, previousDlls = []) {
  for (const old of previousDlls) {
    try { fs.unlinkSync(path.join(projectDir, old)); } catch {}
  }

  const binDir = path.join(sfmlPath, 'bin');
  const copied = [];
  if (!fs.existsSync(binDir)) return copied;

  for (const f of fs.readdirSync(binDir)) {
    if (!f.toLowerCase().endsWith('.dll')) continue;
    fs.copyFileSync(path.join(binDir, f), path.join(projectDir, f));
    copied.push(f);
  }
  return copied;
}

module.exports = function linkVscode(projectDir, sfmlPath, projectName, previousDlls = []) {
  const vscDir  = path.join(projectDir, '.vscode');
  const srcDir  = path.join(projectDir, 'src');
  const exeName = safeExeName(projectName);

  if (!fs.existsSync(vscDir)) fs.mkdirSync(vscDir, { recursive: true });
  if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

  writeJson(path.join(vscDir, 'tasks.json'),            tasksJson(sfmlPath, exeName));
  writeJson(path.join(vscDir, 'launch.json'),           launchJson(exeName));
  writeJson(path.join(vscDir, 'c_cpp_properties.json'), cppPropertiesJson(sfmlPath));

  const mainCpp = path.join(srcDir, 'main.cpp');
  if (!fs.existsSync(mainCpp)) fs.writeFileSync(mainCpp, MAIN_CPP_SFML3, 'utf8');

  const dlls = copySfmlDlls(sfmlPath, projectDir, previousDlls);

  return {
    files: [
      '.vscode/tasks.json',
      '.vscode/launch.json',
      '.vscode/c_cpp_properties.json',
      'src/main.cpp',
      dlls.length ? `${dlls.length} SFML DLL(s) copied to project folder` : 'SFML DLLs (none found in bin/ — check your SFML install)',
    ],
    manifest: {
      ide: 'vscode',
      configFiles: [
        '.vscode/tasks.json',
        '.vscode/launch.json',
        '.vscode/c_cpp_properties.json',
      ],
      dlls,
      stub: 'src/main.cpp',
      exeName,
    },
  };
};
