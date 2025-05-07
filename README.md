# Labelify

**Labelify** is a full-stack web platform designed for collaborative image labeling. It enables users to upload datasets and assign labeling tasks to workers. Workers can then log in to label data efficiently through a dedicated interface.

## 🌐 Live URLs

- **User Frontend**: [labelify-wine.vercel.app](https://labelify-wine.vercel.app/)
- **Worker Frontend**: [labelify-worker.vercel.app](https://labelifyworker.vercel.app/)

## 🗂️ Project Structure

```
Labelify/
├── backend/           # Node.js/Express API server
├── user-frontend/     # React frontend for dataset owners
└── worker-frontend/   # React frontend for data labelers
```

## 🛠️ Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS  
- Backend: Node.js, Express.js  
- Database: PostgreSQL (via Neon)  
- Blockchain: Solana RPC (QuickNode)  
- Cloud Storage: AWS S3 (Pre-signed URLs)  
- Authentication: JWT-based  
- Deployment: Vercel (frontend), Render (backend) 

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```
# PostgreSQL DB (via Neon)
DATABASE_URL=your_postgresql_connection_string

# Solana RPC
RPC_URL=your_solana_rpc_url

# AWS S3
ACCESS_KEY_ID=your_aws_access_key
ACCESS_SECRET=your_aws_secret_key

# JWT Secrets
JWT_SECRET=your_user_jwt_secret
WORKER_JWT_SECRET=your_worker_jwt_secret

# Wallet Key
PRIVATE_KEY=your_solana_wallet_private_key
```

Create a `.env` file in the `user-frontend/ & worker-frontend` directory with the following variables:
```
# Solana RPC
RPC_URL=your_solana_rpc_url

```
⚠️ Do **not** commit real credentials to the repository. Add `.env` to `.gitignore`.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL or Neon account
- AWS S3 bucket with credentials
- Solana wallet and QuickNode RPC endpoint

### Installation

```bash
# Clone the repo
git clone https://github.com/Priyanshuu7/Labelify.git
cd Labelify
```

```bash
# Install backend
cd backend
npm install

# Install user frontend
cd ../user-frontend
npm install

# Install worker frontend
cd ../worker-frontend
npm install
```

### Run the Servers

```bash
# Start backend
cd backend
npm run dev

# Start user frontend
cd ../user-frontend
npm run dev

# Start worker frontend
cd ../worker-frontend
npm run dev
```

- User App: http://localhost:3001  
- Worker App: http://localhost:3002  
- Backend API: http://localhost:3000

## 🎯 Features

- 🔐 Role-based login for Users and Workers  
- 📤 Upload datasets and assign tasks  
- 👷 Workers can label images from dedicated UI  
- 🔗 Blockchain-integrated activity logging (Solana)  
- ☁️ File storage via AWS S3 with pre-signed URLs  
- 📊 Real-time progress tracking for each task

## 🧪 Testing

- Use **Postman** or **curl** to verify backend API responses
- Perform **UI tests** using **React Testing Library** or **Cypress**
- Test flow:
  - User uploads dataset
  - Worker logs in and labels data
  - User sees labeled progress update

## 🤝 Contributing

Contributions are welcome! Fork the repository, create a feature branch, and submit a pull request.

## 📬 Contact

For issues or feedback, visit [GitHub Issues](https://github.com/Priyanshuu7/Labelify/issues)