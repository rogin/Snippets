# Rust

## Getting started

Use [rustup](https://rustup.rs/) to install the toolchain.

[Installing the Rust compiler and toolchain](https://subscription.packtpub.com/book/programming/9781789346572/1/ch01lvl1sec11/installing-the-rust-compiler-and-toolchain)

[Learn Rust](https://www.rust-lang.org/learn)

Google's [Rust training](https://google.github.io/comprehensive-rust/welcome.html)

## Books

* The [Rust Standard Library Cookbook](https://subscription.packtpub.com/book/programming/9781788623926/8/ch08lvl1sec50) might be the most helpful intro book that I've read in terms of items like _Rc_ and examples using them. Review its bookmarks.
* [Rust book](https://doc.rust-lang.org/book/)
* [The Rustonomicon](https://doc.rust-lang.org/nomicon/index.html)
* [Rust Fuzz book](https://rust-fuzz.github.io/book/introduction.html)
* [Rust by Example](https://doc.rust-lang.org/rust-by-example/index.html)
* [Rust Reference](https://doc.rust-lang.org/reference/index.html)
* [The Cargo book](https://doc.rust-lang.org/cargo/)
* [Command-Line Rust](https://www.amazon.com/Command-Line-Rust-Project-Based-Primer-Writing/dp/1098109430) (which I have) walks through reimplementing core linux tools (_head_, _wc_, etc.).

## IDE setup

[Rust on Nails](https://rust-on-nails.com/docs/ide-setup/introduction/) uses [development containers in VS Code](https://code.visualstudio.com/docs/devcontainers/containers) for a rust app. Very helpful.

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

## Lifetimes

[Outlines](https://hashrust.com/blog/lifetimes-in-rust/) the various meanings of 'lifetime' wording.

## Closures

[A great writeup](https://hashrust.com/blog/a-guide-to-closures-in-rust/) detailing differences of `Fn`, `FnOnce`, and `FnMut`.

## Tracing

[This](https://www.lpalmieri.com/posts/2020-09-27-zero-to-production-4-are-we-observable-yet/) covers the hows and whys of moving from logging to tracing.

## Ownership

[OP](https://old.reddit.com/r/rust/comments/14f1mnd/why_is_there_no_standard_way_of_removing_the/) asked about mutability, but [the core issue involves ownership](https://smallcultfollowing.com/babysteps/blog/2014/05/13/focusing-on-ownership/).

We can use [as &_](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=de64020e4a8c2454c9a9861297971ffe) and others.

````rust
//option 1
let x = &mut whatever;
let y = &*x;
//option 2
let y: &_ = x;
//option 3
let x = &*x;
````

## Standard library goodness

[Concat](https://doc.rust-lang.org/std/primitive.slice.html#method.concat) various types

## Destructuring

Function arguments can be destructured as shown [in this thread](https://old.reddit.com/r/rust/comments/14rg4pw/rust_doesnt_have_named_arguments_so_what/jqwomyv/).

_In Rust, anytime you have a binding -- ie, you define a name for a variable -- you have pattern-matching:_

````rust
let Args { opt_a, opt_b } = args;

fn foo(Args { opt_a, opt_b }: Args);
````

_For let, you can even use refutable patterns, by using let..else:_

````rust
let Some(a) = a /_Option<A>_/ else {
    return x;
};
````

More examples

````rust
struct Args { opt_a: i32, opt_b: u32, }

//fn my_function(args: Args) {}
fn my_function(Args {opt_a, opt_b}: Args) {
    println!("{} {}", opt_a, opt_b);
}

fn main() {
    my_function(Args { opt_a: 1, opt_b: 4, });
}
````

and _Defaults can be added by implementing `Default` on the `Args` struct and using `..Default::default()` at the callsite._

## foo

From and Into round-up

TODO: pull the important bits from the following

<https://old.reddit.com/r/rust/comments/14uxt10/from_vs_into_which_should_generic_free_functions/>

<https://www.reddit.com/r/rust/comments/anezli/when_to_use_from_vs_into/?utm_source=reddit&utm_medium=usertext&utm_name=rust&utm_content=t1_jr9rr8b>

<https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=7b0c0bc8e0fc65d30b313899a0d7480c>

<https://ricardomartins.cc/2016/08/03/convenient_and_idiomatic_conversions_in_rust>

## Unsorted

[The Little Book of Rust Books](https://lborb.github.io/book/)

<https://github.com/sger/RustBooks>

You can [implement a trait](https://old.reddit.com/r/rust/comments/14wsv8b/ampersand_in_impl_statement/) for `Reference` which they say can also be done for `Mutable Reference`.

[godbolt](https://godbolt.org/) can be used to decompile a rust program.

[criterion](https://github.com/bheisler/criterion.rs) for benchmarks
[cargo-flamegraph](https://github.com/flamegraph-rs/flamegraph) for performance profiling
[dhat](https://github.com/nnethercote/dhat-rs) for heap profiling

For any crates you like at crates.io, add them to your [following list](https://crates.io/me/following).

Check for gems [here](https://old.reddit.com/r/rust/comments/13zq1j8/what_little_known_rust_feature_or_standard/)

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
