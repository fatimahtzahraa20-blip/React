# Task 62 - Zod Validation in React

## Task purpose

Build a React form that uses a reusable `validateUser` function and Zod to check user data before accepting it. Invalid input displays field-specific errors. Valid input displays the submitted name and email, along with password validation status, inside the app.

The original task describes a validation middleware. In this React implementation, `validateUser` acts as the validation step between form input and the submission handler; it is not Express server middleware.

## Technologies

- React for the form and validation results.
- Zod for the user schema and input validation.
- Vite for local development and production builds.
- CSS for responsive styling.

## Validation rules

| Field | Rule |
| --- | --- |
| Name | Required; must contain at least one character after trimming whitespace. |
| Email | Required; must have a valid email format after trimming whitespace. |
| Password | Required; must contain at least 8 characters. Whitespace is preserved. |

Unknown properties are removed from the parsed data.

## How it works

1. Enter a name, email address, and password.
2. Click **Validate user**.
3. The submit handler passes the form values to `validateUser`.
4. Zod checks the values using `userSchema.safeParse()`.
5. Invalid fields show error messages so the user can correct them.
6. When validation passes, the app shows the validated name, entered email, password validation status, and delivery status. The password input is cleared and the password is not displayed in the result.

Editing a field clears its error and hides the previous result until the form is validated again.

## Run locally

Install Node.js and npm, then run these commands from the project directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal.

To create and preview a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
Task-no-62/
|-- src/
|   |-- main.jsx          # React form, submit handler, and result summary
|   |-- validateUser.js   # Zod schema and reusable validation function
|   `-- styles.css        # Form and result styling
|-- index.html            # App entry page
|-- package.json          # Dependencies and scripts
`-- README.md
```

## validateUser return values

On success, the function returns parsed data:

```js
{ success: true, data: { name, email, password } }
```

On failure, it returns the first error message for each invalid field:

```js
{
  success: false,
  errors: {
    name: 'Name is required',
    email: 'Enter a valid email address',
    password: 'Password must contain at least 8 characters'
  }
}
```

## Try it

| Input | Expected result |
| --- | --- |
| Submit all fields empty | Errors for name, email, and password. |
| Enter only spaces for the name | Name is required. |
| Enter `alex` as the email | Email format error. |
| Enter fewer than 8 characters for the password | Password length error. |
| Enter `Alex Morgan`, `alex@example.com`, and `example123` | Validation passes and the name and email appear in the result. |

## Scope

This task validates and displays data locally in the browser. It does not send emails, submit data to a backend, create accounts, or persist user details. The displayed email is the address entered in the form. Checking its format does not confirm that the address exists or belongs to the person submitting it.
