# Easy Site

Professional web application repository for Easy Site.

## Overview

Easy Site provides a modular, high-performance web structure designed for rapid deployment, modern visual standards, and streamlined maintenance.

- **Live Site:** [https://lucaspaludohenryque-prog.github.io/EasySite/](https://lucaspaludohenryque-prog.github.io/EasySite/)
- **Repository:** [https://github.com/lucaspaludohenryque-prog/EasySite](https://github.com/lucaspaludohenryque-prog/EasySite)

## Project Structure

```text
EasySite/
├── index.html            # Landing page (single page, pt-BR)
├── assets/
│   ├── css/styles.css    # Design tokens and section styles
│   ├── js/main.js        # Interactions and budget simulator (prices in CONFIG)
│   └── img/              # Hero, portfolio and testimonial images
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Git 2.30+
- Python 3 or Node.js to serve static files locally

### Setup

```bash
git clone https://github.com/lucaspaludohenryque-prog/EasySite.git
cd EasySite
python -m http.server 5500
```

Open `http://127.0.0.1:5500`.

### Configuration

Edit `CONFIG` at the top of `assets/js/main.js` to set the WhatsApp number and simulator prices. Plan prices shown in the pricing section live in `index.html`.

## License

This project is licensed under the MIT License.
