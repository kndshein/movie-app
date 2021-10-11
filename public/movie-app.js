var Movie = Backbone.Model.extend({
  urlRoot: "/movies",
  idAttribute: "pk",
  defaults: {
    name: "",
    // genre_fks: [],
  },
});

var Movies = Backbone.Collection.extend({
  url: "http://localhost:3000/movies",
  model: Movie,
});

var movies = new Movies();

var MovieItemView = Backbone.View.extend({
  model: new Movie(),
  tagName: "td",
  initialize: function () {
    this.template = _.template($(".movie-item-template").html());
    this.render();
  },
  render: function () {
    this.$el.html(this.template(this.model));
    console.log(this.$el);
    return this;
  },
});

var MoviesListView = Backbone.View.extend({
  model: movies,
  el: $(".movies-list"),
  initialize: function () {
    this.render();
  },
  render: function () {
    var self = this;
    console.log("hoho", this.$el);
    this.model.fetch().then((response) => {
      _.each(response, function (movie) {
        console.log("hehe", new MovieItemView({ model: movie }).el);
        self.$el.append("<p>Test</p>");
      });
    });
    return this;
  },
});

var moviesListView = new MoviesListView();

$(document).ready(function () {
  // Backbone App setup here
});
