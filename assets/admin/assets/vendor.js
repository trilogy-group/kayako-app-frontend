

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-913b042e","ko-case-checkbox-field":"ko-case-checkbox-field-0438f23d","ko-case-select-field":"ko-case-select-field-b4511849","ko-cases-list":"ko-cases-list-1d6c9107","ko-context-modal":"ko-context-modal-fd84ebbd","ko-datepicker":"ko-datepicker-5f9cf62d","ko-editable-text":"ko-editable-text-8eeb5f0a","ko-feed":"ko-feed-ea1423f0","ko-info-bar":"ko-info-bar-c4c99f2f","ko-page-container":"ko-page-container-34f7cdbb","ko-pagination":"ko-pagination-cf510d91","ko-search":"ko-search-6bbd3038","ko-sidebar":"ko-sidebar-788a5158","ko-tab":"ko-tab-69d3f3e9","login":"login-3eabb6e8","session/cases/index":"session--cases--index-af3d4758","session/showcase":"session--showcase-c51334c1"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
