class InvalidInputError extends Error{

}

class InvalidFileError extends Error {

}

class DatabaseError extends Error{

}

module.exports = {
    InvalidFileError,
    InvalidInputError,
    DatabaseError
}