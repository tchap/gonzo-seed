# inStyle

`inStyle` is a system of describing elements by intuitively nesting all their relevant style properties, even if they are modified by a parent state, class, attribute or media query, both in and out of the current cascade.

Currently available in SASS 3.4.

```Sass
.app > main article div:first-child
  span.thing // let's style span.thing
    color: red
    +in('.app.unleashed article:hover')
      color: blue // .app.unleashed > main article:hover div:first-child span.thing { };
    +in('.isIE4') // .isIE4 .app > main ... span.thing { };
      zoom: 1
```

## Why what?

Consider the following HTML:

```Html
<ul class='links'>
  <li>
    <img ... />
    <a href='#'>Title</a>
    <span>Description...</span>
  </li>
</ul>
```

Let's imagine your design requires you to change `a` color when its parent `li` element is `:hover`ed and this is happening inside your small reusable `.links` component. To make things easier, your app has various skins and views (ex: `<body class='minimal'>`) that change the design of anchors while using the same HTML.

Nothing hard to do, right? This could really be anything in your project - in essence you're changing the style properties of the same `a` element in a few different scenarios, a pattern far too common in CSS authoring.

But at best, you'll end up with this code (using advanced SASS):

```Sass
.links
  list-style: none

  li
    display: block

    a
      line-height: 1.5

      @at-root .minimal &
        line-height: 1.2

    &:hover a
      color: blue
```

Or worse depending on your preferences, closer to plain CSS queries:

```Sass
.links
  list-style: none

  li
    display: block

    a
      line-height: 1.5

.links li:hover a
  color: blue

.minimal .links li a
  line-height: 1.2
```

Notice how even for such a simple usecase, the `a` element is actually styled in three different places. It's already not very readable and it's quite easy to make things even worse.

Let's add more great design. Our links are different in footer, they're inline and white. There's also an alternate version of `.links.with-flowers` for the annual flower appreciation day. 

```Sass
.links
  list-style: none

  li
    display: block

    a
      line-height: 1.5

      @at-root .minimal &
        line-height: 1.2

    &:hover a
      color: blue

.links.with-flowers li a
  background-image: url('flowers.png')

.links.with-flowers li:hover a
  background-position: 10px 10px

footer
  .links li
    display: inline-block

    a
      color: white
```

Even though we're leveraging some pretty SASS to make things clearer, we're still quickly descending into exponential chaos for every modification we add, changing the same element in more and more places.

Surely, we could move the styles for the skin, the media queries, the flower hacks and footer specific stuff into separate files to somewhat reduce the damage to this piece of code, but it's arguable to what degree this improves things. Your styles for the `a` element in your clearly-standalone `.links` component would suddenly be in five separate files.

For reference, this would be the same in pure CSS:

```
.links {
  list-style: none;
}
.links li {
  display: block;
}
.links li a {
  line-height: 1.5;
}
.minimal .links li a {
  line-height: 1.2;
}
.links li:hover a {
  color: blue; 
}
.links.with-flowers li a {
  background-image: url(flowers.png);
}
.links.with-flowers li:hover a {
  background-position: 10px 10px
}
footer .links li {
  display: inline-block;
}
footer .links li a {
  color: #fff;
}
```

Meet the [maintainability monster](http://i.imgur.com/7uA7PAq.jpg).

Part of the problem is that there are no convenient tools to correctly describe the DOM relations that lead to the style changes of our precious `a` - whether it's because of its parents in the cascade being hovered or a stateful or design class changing things around. In such cases, we need to target the same element in a new query or dive into increasingly complicated syntax.

So what about this instead?

```Sass
.links
  list-style: none

  li
    display: block

    +in('footer')
      display: inline-block // footer .links li { };

    a
      line-height: 1.5

      +in('li:hover')
        color: blue // .links li:hover a { };

      +in('.minimal')
        line-height: 1.2 // .minimal .links li a { };

      +in('.links.with-flowers')
        background-image: url('flowers.png') // .links.with-flowers li a { };

        +in('li:hover')
          background-position: 10px 10px // .links.with-flowers li:hover a { };

      +in('footer')
        color: white // footer .links li a { };
```

How does this work?

If some of the compound selectors (eg. `li` in `li:hover` or `.links` in `.links.with-flowers`) is found in the current cascade, it's modified by the additional selectors. If not found, it's expected as a parent of the current selector and prepended instead. Infinitely nestable, accepting multiple queries, modifying any amount of parents and excluding any invalidated parent  group selectors.

Let's add media queries to the mix. In SASS it's provided by the wonderful [include-media](https://github.com/eduardoboucas/include-media), which allows very flexible and expressive conditioning and fits the nestable pattern perfectly - refer to its [documentation](http://include-media.com/#features) for details.

```Sass
article
  max-width: 960px

  +media('>phone', '<desktop')
    max-width: 480px

  +in('.article-listing')
    height: 150px // .article-listing article { };

    +media('<=phone')
      height: 10vh // @media screen and ( ... ) { .article-listing article { ... }; }
```

```Sass
item
  display: flex

  > div:first-child
    flex: 0 0 100px

    +media('<tablet')
      flex-basis: 20vw

      +in('.inverted')
        order: 2  // @media ( ... ) { .inverted item > div:first-child { ... }; }

  > div:nth-child(2)
    flex: 1
```

```Sass
.ultra-search
  display: block

  > div
    height: 40px

    input
      width: 100%
      border-color: blue

      +in('div:hover')
        outline: blue

      +in('.ultra-search.invalid')
        border-color: red

  .suggestion-list
    display: none

    +in('.ultra-search.is-open')
      display: block

      +media('<=phone')
        width: 80vw
```

## Installation

You can use `inStyle` [standalone](src/instyle/core.sass) or with the bundled components and build process to kickstart a stack quicker.

Ruby SASS compilation is required due to reliance on 3.4 features. Conversion to `libsass` should work out of the box once 3.4 is stable.

- Install Ruby - [Win](http://rubyinstaller.org/), [Linux](https://www.ruby-lang.org/en/documentation/installation/#package-management-systems)

- `gem install sass`

- `npm install`

- `gulp`

`main.sass` should be your central point for importing individual components.
Build paths can be changed in `gulpfile.js`.
The build process also autoprefixes properties and optimizes/minifies your selectors and media queries.

## Components

`inStyle` comes with a few hopefully unobtrusive components to get you started on a project.

### Core/Mixins

Some carefully selected mixins are available in the core package, see [this file](src/instyle/mixins.sass) for details.

### Base

Base uses [normalize.css](https://github.com/necolas/normalize.css/) or optionally [Meyer reset](http://meyerweb.com/eric/tools/css/reset/) and can serve as a scaffold for your app/page. Defines industry standard `body` and `html` elements.

### Iconfont

The `gulp` build process automagically converts all your `.svg` icon sources in `components/icons` into a webfont and renders the `icons.sass` component. That allows you to easily use custom icons on pseudoelements without tainting HTML - variable names are created for each icon based on filename.

```Sass
// hamburglar.svg

button:before
  +icon($icon-hamburglar)
```

## Roadmap

- LESS port possible?
- Stylus port
- Improved framework-specific animation components
- Default basic components? (buttons etc.)
- Skinning pattern for independent components that inherits from a base config
