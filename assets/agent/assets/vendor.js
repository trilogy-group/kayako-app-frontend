

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-236c7db7","ko-case-checkbox-field":"ko-case-checkbox-field-e619cf3e","ko-case-select-field":"ko-case-select-field-d8bb319c","ko-cases-list":"ko-cases-list-7d3f59c1","ko-context-modal":"ko-context-modal-82bdb3ee","ko-datepicker":"ko-datepicker-53f4aa87","ko-editable-text":"ko-editable-text-ce190170","ko-feed":"ko-feed-5452f472","ko-info-bar":"ko-info-bar-b83d1b78","ko-page-container":"ko-page-container-b34e35b8","ko-pagination":"ko-pagination-55fa6481","ko-search":"ko-search-bf3d0136","ko-sidebar":"ko-sidebar-c00e8191","ko-tab":"ko-tab-02fd76c2","login":"login-af163758","session/cases/index":"session--cases--index-cf9cf675","session/showcase":"session--showcase-11d6d558"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
