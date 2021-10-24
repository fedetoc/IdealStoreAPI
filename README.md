# Ideal Store API

A JSON API ideal for being consumed by an e-commerce's front-end. This was built for the final project of UTN Node's course.

## Features

- User verification.
- Password Encryption
- Password reset with token
- Secured via JWT login
- Email service
- Likes
- Error handling
- More

## Products Endpoints

- _GET /productos/_ : Get information of all the products stored in the Database. No login required.
- _POST /productos/_ : Save a new product onto the Database. Login is required.
- _GET /productos/:id_ : Get information of a product stored in the Database with an index equal to the parameter provided. No login required
- _PATCH /productos/:id_ : Modify price, name or description of a product published by the user. Login is required.
- _GET /productos/likes/:id_ : Get information of a product and the people who liked. Login is required.
- _PATCH /productos/likes/:id_ : Like a product. This registers the user index onto a product from the Database whose index equals to the provided param. Login is required.
- _GET /productos/misProductos_ : Get information of all the products published by the user. Login is required.

## Users Endpoints

- _POST /usuarios/registro_ : Register a new user.

  > The request's body must contain _email, password, confirmPassword, name, dni_

- _POST /usuarios/verification/:token_ : Verify user Registration. The entire link that contains the tokes is sent to the user's specified email.
- _POST /usuarios/oauth/login_ : Login user with the provided credentials.

  > The request's body must contain _user and password_. The _user_ field can be either the username or the user email.

- _POST /usuarios/oauth/logout_ : Logout user.
- _POST /usuarios/oauth/forgotPassword_ : Accepts an "email" query string. If the user exists in Database, sends him an email providing a link with a token to reset the password.
- _PATCH /usuarios/oauth/forgotPassword_ : Allows the user to finally change his password once the
  emailed token is verified in the _POST usuarios/oauth/forgotPassword/:token_ endpoint.

  > The request's body must be a json containing _password and confirmPassword_ fields.

- _POST usuarios/oauth/forgotPassword/:token_ : Verify the token provided to reset the password.
