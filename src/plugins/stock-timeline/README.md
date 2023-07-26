# Stock Timeline Plugin
Track stock changes made by administrators.

## Getting Started
Add the plugin to your `vendure-config.ts`:
```
plugins:[
   StockTimelinePlugin,
   AdminUiPlugin.init({
   ...
   app: compileUiExtensions({
       ...
        extensions: [
          StockTimelinePlugin.uiExtensions,
        ]
      })
   })
]
```
And then migrate your db.

## Notes
The changes are available in `admin-api` as `StockChangeLog` under each `ProductVariant`.
