---
title: "Linux : Booting Up Process"
date: "2026-07-16"
description: "From power button to login prompt: a step-by-step breakdown of how the Linux kernel wakes up, mounts the root filesystem, and initializes the system."
tags: ["Linux"]
---

## What is Booting Up?

The complete process that follows when a computer is powered on to the login prompt apprearing on screen.

```d2
"Power On" -> BIOS -> GRUB (BootLoader)
"Power On" -> UEFI -> GRUB (BootLoader)
GRUB (BootLoader) -> Linux Kernel -> "initramfs / initrd" -> systemd (PID 1) -> "Services & Targets" -> "Login Prompt / GUI"
```