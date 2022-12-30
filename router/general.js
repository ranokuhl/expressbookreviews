const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const public_users = express.Router()
const jwt = require('jsonwebtoken')
const session = require('express-session')

public_users.use(
	session({secret: 'fingerpint'}, (resave = true), (saveUninitialized = true))
)

public_users.post('/register', (req, res) => {
	const username = req.body.username
	const password = req.body.password

	if (username && password) {
		if (!isValid(username)) {
			users.push({username: username, password: password})
			return res.status(200).json({
				message: 'User successfully registered. Now you can login',
			})
		} else {
			return res.status(404).json({message: 'User already exists!'})
		}
	}
	return res.status(404).json({message: 'Unable to register user.'})
})

// Get the book list available in the shop
public_users.get('/', function (req, res) {
	res.send(books)
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
	const isbn = req.params.isbn

	res.send(books[isbn])
})

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
	const author = req.params.author

	const newBookArray = []
	Object.values(books).map(book => {
		if (book.author === author) {
			newBookArray.push(book)
		}
	})
	res.send(newBookArray)
})

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
	const title = req.params.title

	const newTitleArray = []
	Object.values(books).map(book => {
		if (book.title === title) {
			newTitleArray.push(book)
		}
	})
	res.send(newTitleArray)
})

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
	const reviewISBN = req.params.isbn

	Object.entries(books).map(book => {
		if (book[0] === reviewISBN) {
			res.send(book[1].reviews)
		}
	})
})

///////////////////////////////////////////////////////////////////////////////

const authenticatedUser = (username, password) => {
	//returns boolean
	const matchingUsers = users.filter(
		user => user.username === username && user.password === password
	)
	return matchingUsers.length > 0
}

///////////////////////////////////////////////////////////////////////////////
public_users.post('/login', (req, res) => {
	const username = req.body.username
	const password = req.body.password

	if (!username || !password) {
		return res.status(404).json({message: 'Error logging in'})
	}

	if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign(
			{
				data: password,
			},
			'access',
			{expiresIn: 60 * 60}
		)

		req.session.authorization = {
			accessToken,
			username,
		}
		return res.status(200).send('User successfully logged in')
	} else {
		return res
			.status(208)
			.json({message: 'Invalid Login. Check username and password'})
	}
})

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

module.exports.general = public_users
