# PAA INVOICING

> The main goal of this project to visualize invoicing data from an xlsx file for auditing purposes.

> There were two functional achievements
> 1. Parse xlsx files and create data structures for graph data.
> 2. Utilize graphing libraries to visualize the data.
- - -

## Table of Contents
- [Summary](#summary)
- [Deployment](#deployment)
- [References](#references)

## SUMMARY
- Technology: NextJS, MaterialUI, Tailwind, Formidable, Recharts, xlsx/SheetsJS

## DEPLOYMENT
TODO

## PROJECT CHALLANGES
- NextJS version choice
  - Next 13 brings a new [app router paradigm](https://nextjs.org/docs/app). This is clearly the path most developers will take in the future. After familiarizing myself with both Next file systems I've decided to stay with the better-supported `src` file system.
  - Why did I make this choice?
- Implementing MaterialUI in NextJS
  - Unlike a SPA like React, NextJS requires much more boilerplate code to get MaterialUI caches to work correctly.
  - Currently the best option supported by the MaterialUI team is throught he src file system where you can still utilize and customize the `_app.tsx` and `_document.tsx` file.
  - Going down the rabbit hole of "how do I get this to work in the app router" led me to threads with many [disgruntled programmers](https://www.reddit.com/r/reactjs/comments/yfte5q/is_it_worth_getting_into_nextjs_13_now/) that explained they get by with hacky bandaids. I've decided to develop with the `src` file system until the new paradigm receives better support from the eco-system.
- Deciding on a bundler
  - Luckily Vercel also creates a new bundler called [TurboPack](https://turbo.build/pack). Unfortunately it doesn't work with my code.
  - Through debugging, I believe the bundler is not compatable with file system libraries I'm implementing in my code, which is a large part of functionality for this application.
  - I've decided to stick to the native bundler and, again, wait until TurboPack leaves beta.   
- Creating a useful type library for complex data structures for visualization.
- Error handling from prop drilling getServerSideProps
- Dockerizing a NextJS enviromnent
- Customizing the Rechart chart to display a lot of data with visual clarity

## REFERENCES
- [Recharts: visualizing library](https://recharts.org/en-US/examples)
- [SheetsJS: file parser](https://github.com/SheetJS/sheetjs)
- [SheetsJS Gitea version](https://git.sheetjs.com/sheetjs/sheetjs)
- [Filesac: quality of life file system package](https://www.npmjs.com/package/filesac)
- [Insanely basic login guide](https://blog.logrocket.com/guide-cookies-next-js/)
- [Dockerizing a NextJS app](https://www.youtube.com/watch?v=7vBUbpbl-JA)
- [Deploying a NextJS app through the vercel CLI](https://www.youtube.com/watch?v=4DbNUJ-9_U4)
