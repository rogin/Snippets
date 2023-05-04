# Rust

## Getting started

Use [rustup](https://rustup.rs/) to install the toolchain.

[Installing the Rust compiler and toolchain](https://subscription.packtpub.com/book/programming/9781789346572/1/ch01lvl1sec11/installing-the-rust-compiler-and-toolchain)

[Learn Rust](https://www.rust-lang.org/learn)

## Books

* The [Rust Standard Library Cookbook](https://subscription.packtpub.com/book/programming/9781788623926/8/ch08lvl1sec50) might be the most helpful intro book that I've read in terms of items like _Rc_ and examples using them. Review its bookmarks.
* [Rust book](https://doc.rust-lang.org/book/)
* [The Rustonomicon](https://doc.rust-lang.org/nomicon/index.html)
* [Rust Fuzz book](https://rust-fuzz.github.io/book/introduction.html)
* [Rust by Example](https://doc.rust-lang.org/rust-by-example/index.html)
* [Rust Reference](https://doc.rust-lang.org/reference/index.html)
* [The Cargo book](https://doc.rust-lang.org/cargo/)

## Async related

[async/await](https://tmandry.gitlab.io/blog/posts/optimizing-await-1/)
[Pin related](https://fasterthanli.me/articles/pin-and-suffering)
[Futures](https://fasterthanli.me/articles/understanding-rust-futures-by-going-way-too-deep)

## Error related

[A great walkthrough](https://www.lpalmieri.com/posts/error-handling-rust/) of error handling by the [Zero to Production in Rust](https://www.zero2prod.com/) author.

[Recoverable Errors with Result](https://doc.rust-lang.org/stable/book/ch09-02-recoverable-errors-with-result.html)

## API related

* [Elegant Library APIs in Rust - Pascal’s Scribbles](https://deterministic.space/elegant-apis-in-rust.html)
* [Checklist](https://rust-lang.github.io/api-guidelines/checklist.html)

## Optimizations

[Paraphrasing](https://old.reddit.com/r/rust/comments/133wk4x/help_with_rust_program_performance/jid46k4/): _But if you need to squeeze every bit of speed out of it, add `lto = true` to your release profile in your `cargo.toml` to enable link time optimizations. It increases build times for your release builds, but I find it gives 10-20% better performance._

[More](https://old.reddit.com/r/rust/comments/133wk4x/help_with_rust_program_performance/jibsyge/): `cargo run` will also build, so if you do `cargo build --release` followed by `cargo run` then it will run an __unoptimized__ build

## Unsorted

For any crates you like at crates.io, add them to your [following list](https://crates.io/me/following).

[Using various lists](https://subscription.packtpub.com/book/application-development/9781788995528/4/ch04lvl1sec23/linked-lists)

Link to [std lib](https://doc.rust-lang.org/std/index.html).
Link to crate [docs](https://docs.rs/).

[Blessed](https://blessed.rs/) - An unofficial guide to the Rust ecosystem

Check out the [github star list](https://github.com/stars/rogin/lists/rust).

[A tour of standard library traits](https://github.com/pretzelhammer/rust-blog/blob/master/posts/tour-of-rusts-standard-library-traits.md).

[Rustlings](https://github.com/rust-lang/rustlings/) are small exercises.

From [Learn Rust the Dangerous Way](https://cliffle.com/p/dangerust/6/)

* Document the compiler version you tested with, or ideally, pin it in your build system. (Rust has the [rust-toolchain](https://docs.rs/rust-toolchain/latest/rust_toolchain/) file to do this.)
* Include a benchmark test that will indicate if things have suddenly gotten slower, so you can at least know to investigate. Ensure that this test runs as part of the build or continuous integration flow. (For Rust projects using Cargo, I recommend [Criterion](https://docs.rs/criterion/).)

[Rust Language Cheat Sheet](https://cheats.rs/)

A great deep dive into [unique access](https://limpet.net/mbrubeck/2019/02/07/rust-a-unique-perspective.html).

[Enabling debug info](https://blog.rust-lang.org/2023/04/20/Rust-1.69.0.html#debug-information-is-not-included-in-build-scripts-by-default-anymore)
