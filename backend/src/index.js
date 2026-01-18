const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); 
const authRoutes = require('./routes/auth/auth'); 
const userRoutes = require('./routes/user/user');
const todosRoutes = require('./routes/todos/todos');
const notFound = require('./middleware/notFound'); 
require('./config/db'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'frontend'))); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use('/api', authRoutes);
app.use('/api', userRoutes); 
app.use('/api', todosRoutes);

app.use(notFound);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});