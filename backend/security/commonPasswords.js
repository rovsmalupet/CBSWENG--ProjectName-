/**
 * commonPasswords.js — passwords refused regardless of how they score against
 * the character-class rules. [CSSECDV 2.1.5]
 *
 * Two lists, because they defend against different things:
 *
 *  EXACT   classic leaked-credential-list entries. Most already fail the length
 *          and complexity rules, but they are cheap to check and make the
 *          policy's intent explicit.
 *
 *  BASES   the alphabetic core of passwords that *do* satisfy complexity.
 *          "Password123!" has upper, lower, digit, and symbol — it passes every
 *          mechanical rule and is still one of the most guessed strings in
 *          existence. We strip non-letters and compare the remainder, so
 *          Password123!, P@ssw0rd2026, and Passw0rd! are all caught by the
 *          single entry "password". This is the check that actually earns its
 *          keep once a 12-character minimum is in force.
 *
 * Bundled locally on purpose: a password check must never make a network call.
 * Extend either list freely — everything downstream is driven from here.
 */

export const EXACT_COMMON_PASSWORDS = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234",
  "111111", "1234567", "dragon", "123123", "baseball", "abc123", "football",
  "monkey", "letmein", "shadow", "master", "666666", "qwertyuiop", "123321",
  "mustang", "1234567890", "michael", "654321", "superman", "1qaz2wsx",
  "7777777", "121212", "000000", "qazwsx", "123qwe", "killer", "trustno1",
  "jordan", "jennifer", "zxcvbnm", "asdfgh", "hunter", "buster", "soccer",
  "harley", "batman", "andrew", "tigger", "sunshine", "iloveyou", "charlie",
  "robert", "thomas", "hockey", "ranger", "daniel", "starwars", "klaster",
  "112233", "george", "computer", "michelle", "jessica", "pepper", "1111",
  "zxcvbn", "555555", "11111111", "131313", "freedom", "777777", "pass",
  "maggie", "159753", "aaaaaa", "ginger", "princess", "joshua", "cheese",
  "amanda", "summer", "love", "ashley", "nicole", "chelsea", "biteme",
  "matthew", "access", "yankees", "987654321", "dallas", "austin", "thunder",
  "taylor", "matrix", "mobilemail", "mom", "monitor", "monitoring", "montana",
  "moon", "moscow", "admin", "administrator", "root", "toor", "guest", "test",
  "welcome", "changeme", "passw0rd", "p@ssw0rd", "qwerty123", "letmein123",
  "adminadmin", "admin123", "donor123", "ngo12345", "bayanihub", "bayanihub123",
]);

export const COMMON_PASSWORD_BASES = new Set([
  "password", "passwort", "contrasena", "passphrase", "pass",
  "welcome", "letmein", "changeme", "trustno", "iloveyou", "loveyou",
  "admin", "administrator", "superuser", "root", "guest", "user", "login",
  "qwerty", "qwertyuiop", "asdfgh", "asdfghjkl", "zxcvbn", "zxcvbnm",
  "abcdef", "abcdefg", "abcd", "aaaa", "test", "testing", "demo", "sample",
  "monkey", "dragon", "master", "shadow", "sunshine", "princess", "football",
  "baseball", "soccer", "hockey", "superman", "batman", "starwars", "pokemon",
  "freedom", "whatever", "cheese", "computer", "internet", "secret", "secure",
  "security", "hello", "helloworld", "summer", "winter", "spring", "autumn",
  "january", "february", "march", "april", "june", "july", "august",
  "september", "october", "november", "december",
  // Project- and locale-specific guesses an attacker would try first.
  "bayanihub", "bayanihubadmin", "bayanihubph", "bayanihubdonor",
  "philippines", "pilipinas", "manila", "quezoncity", "makati", "dlsu",
  "lasalle", "animo", "cssecdv", "ccapdev", "cbsweng",
]);

export default { EXACT_COMMON_PASSWORDS, COMMON_PASSWORD_BASES };
