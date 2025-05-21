#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix untuk __dirname equivalent di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const type = args[0];
const rawName = args[1];

if (!type || !rawName) {
    console.error('‚ùå Usage: make/delete [type|resource] [Name]');
    process.exit(1);
}

const toPascalCase = (str) => {
    return str
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
};

const name = toPascalCase(rawName);
const nameLower = rawName.toLowerCase();

const templates = {
    controller: (name) =>
        `export default class ${name}Controller {
    static async index(req, res, next) {
        try {
            res.send("${name} index");
        } catch (e) {
            next(e);
        }
    }

    static async create(req, res, next) {
        try {
            res.send("${name} create form");
        } catch (e) {
            next(e);
        }
    }

    static async store(req, res, next) {
        try {
            res.send("${name} stored");
        } catch (e) {
            next(e);
        }
    }

    static async show(req, res, next) {
        try {
            const { id } = req.params;
            res.send(\`${name} show \${id}\`);
        } catch (e) {
            next(e);
        }
    }

    static async edit(req, res, next) {
        try {
            const { id } = req.params;
            res.send(\`${name} edit \${id}\`);
        } catch (e) {
            next(e);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            res.send(\`${name} updated \${id}\`);
        } catch (e) {
            next(e);
        }
    }

    static async destroy(req, res, next) {
        try {
            const { id } = req.params;
            res.send(\`${name} deleted \${id}\`);
        } catch (e) {
            next(e);
        }
    }
}
`,

    service: (name) =>
        `export default class ${name}Service {
    // TODO: Implement ${name} service
}
`,

    repository: (name) =>
        `export default class ${name}Repository {
    // TODO: Implement ${name} repository
}
`,

    validation: (name) =>
        `import { z } from "zod";

export default class ${name}Validation {
    static CREATE = z.object({
        // username: z.string().min(3),
    });
}
`,

    test: (name) =>
        `import request from "supertest";
import 'dotenv/config';

const api = \`\${process.env.EXPRESS_TEST}\`;

describe("${name}Controller", () => {
    it("should return a 200 status code", async () => {
        const response = await request(api).get('/');
        expect(response.status).toBe(200);
    });
});
`,
};

const createFile = (dir, fileName, content) => {
    const fullPath = path.join(process.cwd(), dir, fileName);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    if (fs.existsSync(fullPath)) {
        console.warn(`‚ö†Ô∏è  File already exists: ${path.join(dir, fileName)}`);
        return;
    }

    fs.writeFileSync(fullPath, content, { flag: 'w' });
    console.log(`‚úÖ Created: ${path.join(dir, fileName)}`);
};

const deleteFile = (dir, fileName) => {
    const fullPath = path.join(process.cwd(), dir, fileName);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Ì∑ëÔ∏è  Deleted: ${path.join(dir, fileName)}`);
    } else {
        console.warn(`‚ö†Ô∏è  File not found: ${path.join(dir, fileName)}`);
    }
};

const deleteFolderIfEmpty = (folder) => {
    const fullPath = path.join(process.cwd(), folder);
    if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) {
        fs.rmdirSync(fullPath);
        console.log(`Ì∑ëÔ∏è  Deleted folder: ${folder}`);
    }
};

const processFile = (action, type, name) => {
    const baseName = name.toLowerCase();
    const className = toPascalCase(name);

    const fileName = type === 'test'
        ? `${baseName}.test.js`
        : `${baseName}.${type}.js`;

    const folder = path.join('src', 'domains', baseName);

    if (action === 'create') {
        const content = templates[type](className);
        createFile(folder, fileName, content);
    } else {
        deleteFile(folder, fileName);
    }
};

const handleAction = (action) => {
    const folder = path.join('src', 'domains', rawName.toLowerCase());

    if (type === 'resource') {
        for (const t of ['controller', 'service', 'repository', 'validation', 'test']) {
            processFile(action, t, rawName);
        }

        if (action === 'delete') {
            deleteFolderIfEmpty(folder);
        }
    } else if (templates[type]) {
        processFile(action, type, rawName);

        if (action === 'delete') {
            deleteFolderIfEmpty(folder);
        }
    } else {
        console.error(`‚ùå Unknown type: ${type}`);
    }
};

const command = process.env.npm_lifecycle_event;
if (command === 'delete') {
    handleAction('delete');
} else {
    handleAction('create');
}
