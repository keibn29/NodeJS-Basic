import express from 'express';
import homeController from '../controller/homeController'
import multer from 'multer';
import path from 'path';
import appRoot from 'app-root-path';

let router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + '/src/public/images/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

let upload = multer({ storage: storage, fileFilter: imageFilter });
let uploadMul = multer({ storage: storage, fileFilter: imageFilter }).array('multiple_images', 5);

const initWebRoute = (app) => {
    router.get('/', homeController.getHomepage)
    router.get('/detail/user/:id', homeController.getDetailpage)

    router.post('/create-new-user', homeController.creatNewUser)
    router.get('/edit-user/:id', homeController.getEditpage)
    router.post('/update-user', homeController.updateUser)
    router.post('/delete-user', homeController.deleteUser)

    router.get('/upload', homeController.getUploadpage)
    router.post('/upload-profile-pic', upload.single('profile_pic'), homeController.handleUploadFile)
    router.post('/upload-multiple-images', (req, res, next) => {
        uploadMul(req, res, (err) => {
            if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
                res.send('Upload quá giới hạn quy định')
            } else if (err) {
                res.send(err)
            } else {
                next();
            }
        })
    }, homeController.handleUploadMultipleFile)

    router.get('/about', (req, res) => {
        res.send(`I'm Kei!`)
    })

    return app.use('/', router)
}

export default initWebRoute;