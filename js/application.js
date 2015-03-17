var App = Ember.Application.create({
  debug: true
});

App.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'exermatic-data'
});

App.Walk = DS.Model.extend({
  dateWalked: DS.attr('date'),
  distanceWalked: DS.attr('number'),
  minutesTaken: DS.attr('number'),
  mood: DS.attr('string'),

  kmPerHour: function () {
    return 60 * this.get('distanceWalked') / this.get('minutesTaken');
  }.property('distanceWalked', 'minutesTaken'),

  moodImage: function () {
    var mood = this.get('mood');
    switch (mood.toLowerCase()) {
    case 'good':
      return 'img/good.png';
      break;
    case 'ok':
      return 'img/ok.png';
      break;
    case 'bad':
      return 'img/bad.png';
      break;
    default:
      return 'img/unkown.png';
    }
  }.property('mood'),

  isGood: function () {
    return this.get('mood').toLowerCase() === 'good';
  }.property('mood')
});

App.Router.map(function () {
  this.resource('walks', function () {
    this.route('walk', {
      path: '/:walk_id'
    });
    this.route('add', {
      path: 'add'
    });
  });
  this.route('summary');
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

App.WalksAddController = Ember.Controller.extend({
  error: "",

  actions: {
    addWalk: function () {
      var newDate = this.get('newDate'),
        newDistance = this.get('newDistance'),
        newTime = this.get('newTime'),
        newMood = this.get('newMood');

      if (typeof newDate === 'undefined' ||
        typeof newDistance === 'undefined' ||
        typeof newTime === 'undefined' ||
        typeof newMood === 'undefined') {
        this.set('error', 'Please populate all the fields');
        return;
      }

      this.set('error', '');

      walk = this.store.createRecord('walk', {
        dateWalked: new Date(newDate),
        distanceWalked: newDistance,
        minutesTaken: newTime,
        mood: newMood
      });

      walk.save();

      this.set('newDate', '');
      this.set('newDistance', '');
      this.set('newTime', '');
      this.set('newMood', '');

      this.transitionTo('walks.walk', walk);
    }
  }
});

App.SummaryRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('walk');
  }
});

App.SummaryController = Ember.ArrayController.extend({

  averageSpeed: function (data) {
    var length = data.get('length'),
      sum = 0;

    return (data.reduce(function (previous, item) {
      return previous + item.get('kmPerHour');
    }, sum) / length);
  },

  proportionGood: function () {
    var content = this.get('content'),
      allCount = content.get('length'),
      goodCount = content.filterBy('isGood', true).get('length');
    return (100 * goodCount / allCount).toFixed(0) + "%";
  }.property('content.@each.mood'),

  averageGood: function () {
    var data = this.get('content').filterBy('isGood', true);
    return this.averageSpeed(data);
  }.property('content.@each.kmPerHour'),

  averageAll: function () {
    var data = this.get('content');
    return this.averageSpeed(data);
  }.property('content.@each.kmPerHour')
});

App.MoodPickerComponent = Ember.Component.extend({
  didInsertElement: function () {
    this.set("value", "good");
  },
  isGood: function () {
    return this.get('value') == 'good';
  }.property('value'),
  isOk: function () {
    return this.get('value') == 'ok';
  }.property('value'),
  isBad: function () {
    return this.get('value') == 'bad';
  }.property('value'),
  setMood: function (mood) {
    this.set('value', mood);
  }
});

Ember.Handlebars.registerBoundHelper('humanDate', function (input) {
  return moment(input).fromNow();
});

Ember.Handlebars.registerBoundHelper('twoDecimalPlaces', function (input) {
  return parseFloat(input, 10).toFixed(2);
});
