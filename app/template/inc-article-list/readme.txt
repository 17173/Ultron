inc-article-list-1替换 <div cms-include="article-list-page"></div> 注意该结构放在列表（cms-data-type="list-news/mixed"）之后
重构注意：结构外层为div class=pagination 里层ul嵌套li嵌套a且均不带类名，当前选中项类名为current在a元素上控制。