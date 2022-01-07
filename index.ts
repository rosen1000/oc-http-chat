import * as path from 'path';
import express from 'express';
import * as http from 'http';
import * as ejs from 'ejs';
import ioserver from 'socket.io';
import multer from 'multer';
import Index from './@types';

const app = express();
const server = new http.Server(app);
const io = ioserver(server);
const storage = multer.diskStorage({
    destination: './public',
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`)
    },
});
const upload = multer({
    storage: storage,
    fileFilter(_req, file, cb) {
        if (file.mimetype.startsWith('image')) cb(null, true);
        else cb(new Error('Not an image'));
    },
}).single('avatar');

io.on('connection', (socket) => {
    let username: string;

    console.log("connection!");

    socket.on('user_join', (data: any) => {
        username = data;
        if (data) console.log(data);
        socket.broadcast.emit('user_join', data);
    });

    socket.on('chat_message', (data: any) => {
        data.username = username;
        data.image = 'https://avatarfiles.alphacoders.com/878/87813.png';
        socket.broadcast.emit('chat_message', data);
    });
});

//#region view engine
app.set('views', path.join(__dirname, '../views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
//#endregion

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(multer().array('avatar', 1));

app.get('/', (_req, res) => res.render('index.html'));

app.get('/character/create', (_req, res) => res.render('character_creation.html'));

app.post('/character/create', upload, (req, res) => {
    console.log(req.file);
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});
