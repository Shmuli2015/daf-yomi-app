# Performance & Virtualization Rules

- **Long Lists**: For large datasets (masechtot, dapim, study history), always use `FlatList` with stable `keyExtractor` and `getItemLayout` when item heights are uniform. Never render hundreds of items using `.map()` inside a plain `ScrollView`.
