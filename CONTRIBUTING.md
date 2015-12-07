# Contributing

If you’re looking for ways to contribute, please [peruse open issues](https://github.com/marcusdb/microGears/issues?milestone=&q=is%3Aopen). If you already have an idea, please check past issues to see whether your idea or a similar one was previously discussed.

Before submitting a pull request, consider implementing a live example first. Real-world use cases go a long way to demonstrating the usefulness of a proposed feature. The more complex a feature’s implementation, the more usefulness it should provide.

If your proposed feature does not involve changing core functionality, consider submitting it instead as a plugin. New core features should be for general use, whereas plugins are suitable for more specialized use cases. When in doubt, it’s easier to start with a plugin before “graduating” to core.

To contribute new documentation just [edit the Wiki](https://github.com/marcusdb/microGears/wiki)!

## How to Submit a Pull Request

1. Click the “Fork” button to create your personal fork of the microGears repository.

2. After cloning your fork of the microGears repository in the terminal, run `npm install` to install microGears’s dependencies.

3. Create a new branch for your new feature. For example: `git checkout -b my-awesome-feature`. A dedicated branch for your pull request means you can develop multiple features at the same time, and ensures that your pull request is stable even if you later decide to develop an unrelated feature.

4. Use `grunt test` to run tests and verify your changes. If you are adding a new feature, you should add new tests! If you are changing existing functionality, make sure the existing tests run, or update them as appropriate.

5. Submit your pull request, and good luck!
