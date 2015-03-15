var App = Ember.Application.create();

App.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'exermatic-data'
});

App.Walk = DS.Model.extend({
  dateWalked: DS.attr('date'),
  distanceWalked: DS.attr('number'),
  minustesTaken: DS.attr('number'),
  mood: DS.attr('string')
});

App.Router.map(function () {
  this.resource('walks', function () {
    this.route('add');
    this.route('walk', {
      path: '/:id'
    });
  });
});

App.IndexRoute = Ember.Route.extend({
  beforeModel: function () {
    this.transitionTo('walks');
  }
});

App.WalksRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('walk');
  }
});

App.WalksAddRoute = Ember.Route.extend({
  model: function () {
    return this.store.createRecord('walk');
  },
  deactivate: function () {
    var walk = this.controllerFor('walks.add').get('content');

    if (walk.get('isDirty')) {
      walk.deleteRecord();
    }
  }
});

App.WalksAddController = Ember.ObjectController.extend({
  error: '',
  actions: {
    addWalk: function () {
      var walk = this.get('content');
      if (typeof walk.get('dateWalked') === 'undefined' ||
        typeof walk.get('distanceWalked') === 'undefined' ||
        typeof walk.get('minutesTaken') === 'undefined' ||
        typeof walk.get('mood') === 'undefined') {
        this.set('error', 'Please populate all the fields.');
        return;
      }

      walk.set('dateWalked', new Date(walk.get('dateWalked')));

      this.set('error', '');
      this.transitionToRoute('walks.walk', walk);
    }
  }
});