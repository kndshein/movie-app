var Movie = Backbone.Model.extend({
  urlRoot: "/movies",
  idAttribute: "pk",
  defaults: {
    name: "defaultName",
  },
});

var Movies = Backbone.Collection.extend({
  url: "/movies",
  model: Movie,
});

var movies = new Movies();

$(document).ready(function () {
  var MovieItemView = Backbone.View.extend({
    model: new Movie(),
    tagName: "tr",
    initialize: function () {
      this.template = _.template($(".movie-item-template").html());
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });

  var MoviesListView = Backbone.View.extend({
    model: movies,
    el: $(".movies-list"),
    initialize: function () {
      this.model.on("add", this.render, this);
      this.model.fetch({
        success: function (response) {
          _.each(response.toJSON(), function (movie) {
            console.log("Successfully GOT movie with _id: " + movie.name);
          });
        },
        error: function () {
          console.log("Failed to get movies!");
        },
      });
    },
    render: function () {
      var self = this;
      console.log(this.model);
      _.each(this.model.toArray(), function (movie) {
        self.$el.append(new MovieItemView({ model: movie }).render().$el);
      });
      return this;
    },
  });

  var moviesListView = new MoviesListView();

  // Backbone App setup here
});
