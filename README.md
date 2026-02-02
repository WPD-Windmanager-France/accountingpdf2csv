<div align="center">

# 📄 CEGID PDF to CSV

**Convertissez vos relevés bancaires PDF en fichiers CSV compatibles CEGID Expert**

[![Déployé sur Vercel](https://img.shields.io/badge/Vercel-Déployé-black?style=for-the-badge&logo=vercel)](https://cegid-pdf-to-csv.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[**🚀 Accéder à l'application**](https://cegid-pdf-to-csv.vercel.app/)

</div>

---

## ✨ Fonctionnalités

- 📤 **Upload multiple** — Glissez-déposez plusieurs fichiers PDF en une fois
- 👀 **Prévisualisation** — Visualisez les transactions extraites dans un tableau éditable
- ✏️ **Édition en ligne** — Modifiez les colonnes JOURNAL, GÉNÉRAL et AUXILIAIRE directement
- 📥 **Export CSV** — Téléchargez les fichiers individuellement ou tous en un clic
- ⚡ **Traitement rapide** — Extraction optimisée pour les relevés bancaires

---

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.12, pdfplumber, pandas |
| **Déploiement** | Vercel (Serverless Functions) |

---

## 🚀 Développement Local

### Prérequis

- Node.js 18+
- Python 3.10+
- npm ou yarn

### Installation

```bash
# Cloner le repo
git clone https://github.com/WPD-Windmanager-France/cegid-pdf-to-csv.git
cd cegid-pdf-to-csv

# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd api
pip install -r requirements.txt
cd ..
```

### Lancer en local

```bash
# Terminal 1 - Frontend (port 3000)
npm run dev

# Terminal 2 - Backend (port 8000)
cd api
uvicorn index:app --reload --port 8000
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📁 Structure du Projet

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # Page principale
│   ├── layout.tsx         # Layout racine
│   └── globals.css        # Styles globaux
├── api/                    # Backend FastAPI
│   ├── index.py           # Point d'entrée API
│   ├── pdf_processor.py   # Logique d'extraction PDF
│   └── requirements.txt   # Dépendances Python
├── package.json           # Dépendances Node.js
├── tailwind.config.ts     # Configuration Tailwind
├── tsconfig.json          # Configuration TypeScript
└── vercel.json            # Configuration Vercel
```

---

## 📋 Format de Sortie

Les fichiers CSV générés sont au format **ECREXCEL** compatible CEGID Expert :

| Colonne | Description |
|---------|-------------|
| JOURNAL | Code journal comptable |
| DATE | Date de l'opération |
| GÉNÉRAL | Compte général |
| AUXILIAIRE | Compte auxiliaire |
| LIBELLÉ | Description de l'opération |
| DÉBIT | Montant débit |
| CRÉDIT | Montant crédit |

---

## 🌐 Déploiement

L'application est automatiquement déployée sur Vercel à chaque push sur la branche `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/WPD-Windmanager-France/cegid-pdf-to-csv)

---

## 📄 Licence

Projet interne WPD Windmanager France.

---

<div align="center">

**Développé avec ❤️ pour simplifier la comptabilité**

</div>
