/// --------------------------------------------------------------------------------
// dependencies
// --------------------------------------------------------------------------------

import kleur from 'kleur';



// --------------------------------------------------------------------------------
// configure not found middleware
// --------------------------------------------------------------------------------

const NotFoundMiddleware = (req, res, next) => {
    const method = req.method;
    const path = req.path;

    // Warna berdasarkan method
    let coloredMethod = method;

    switch (method) {
        case 'GET':
            coloredMethod = kleur.blue(method);
            break;
        case 'POST':
            coloredMethod = kleur.green(method);
            break;
        case 'PATCH':
            coloredMethod = kleur.magenta(method);
            break;
        case 'PUT':
            coloredMethod = kleur.yellow(method);
            break;
        case 'DELETE':
            coloredMethod = kleur.red(method);
            break;
        default:
            coloredMethod = kleur.white(method);
    }

    console.log(`❌ Route ${coloredMethod} - ${path} not found`);

    res.status(404).json({
        message: `Route [${method}] - [${path}] not found`
    });
};

// --------------------------------------------------------------------------------
// export default
// --------------------------------------------------------------------------------
export default NotFoundMiddleware;

