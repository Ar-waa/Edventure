# Edventure 🎓🎮

**Making learning more engaging through gamification.**

Edventure is a gamified learning platform designed to motivate students to study more effectively while making the learning experience enjoyable. The project explores how game-inspired experiences can encourage students to engage with educational activities.

🔗 **Repository:** https://github.com/Ar-waa/Edventure

## Project overview

Traditional study methods can sometimes feel repetitive or difficult to sustain. Edventure takes a gamification-focused approach to learning, aiming to make study activities more interactive, motivating, and enjoyable.

### Project goals

- Make learning more engaging through a game-inspired experience.
- Encourage consistent student participation and motivation.
- Combine educational activities with an enjoyable user experience.
- Provide a foundation for a student-focused learning platform.

> **Note:** These are the project's stated aims, not a claim that any particular rewards, quizzes, leaderboards, or tracking features have been verified in the source code.

## Technology and repository structure

The public repository uses primarily **JavaScript** and **CSS**, and separates application code into client and server directories.

```text
Edventure/
├── client/       # Client-side application
├── server/       # Server-side application
├── test.py       # Python file included in the repository
└── .gitignore
```

Specific frameworks, database services, API endpoints, and environment variables should be confirmed from the files in `client/` and `server/` before documenting them as project requirements.

## Getting started

### Prerequisites

- Git
- Node.js and npm, **if** the client/server folders use Node-based `package.json` files
- Any additional services or configuration required by the application

### 1. Clone the repository

```bash
git clone https://github.com/Ar-waa/Edventure.git
cd Edventure
```

### 2. Inspect the project scripts

Check the client and server folders for `package.json` files and their `scripts` sections. If both folders are Node projects, install dependencies separately:

```bash
cd client
npm install
cd ../server
npm install
```

### 3. Configure the application

If the code uses environment variables, create local environment files using the variable names required by the source code. **Do not commit secrets, credentials, or `.env` files to GitHub.**

### 4. Start the application

Run the start or development script defined in each folder's `package.json`. For example, **only if** a folder defines a `dev` script:

```bash
npm run dev
```

You may need separate terminal windows for the client and server. The correct commands, ports, and any database setup depend on the repository's actual configuration; they could not be independently verified here.

## Development

This is a collaborative project. Contributions and improvements can be proposed through GitHub issues and pull requests.

1. Fork the repository and create a feature branch.
2. Make and test your changes.
3. Commit with a descriptive message.
4. Open a pull request explaining what changed.

## Contributors

See the [GitHub contributors page](https://github.com/Ar-waa/Edventure/graphs/contributors) for project contributors.

## License

No license file was visible in the repository root during this review. Unless a license is added, do not assume the project is licensed for reuse or redistribution.

---

*Edventure — making education an adventure.*
