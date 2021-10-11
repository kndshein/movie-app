let Movie = Backbone.Model.extend({
  urlRoot: "/movies",
  idAttribute: "pk",
});

let Movies = Backbone.Collection.extend({
  url: "/movies",
  model: Movie,
});

let movies = new Movies();

$(document).ready(function () {
  let genres = {};
  fetch("http://localhost:3000/genres")
    .then((response) => response.json())
    .then((data) =>
      data.map((ele) => {
        genres[ele.pk] = ele.name;
      })
    );

  let MovieItemView = Backbone.View.extend({
    model: new Movie(),
    tagName: "tr",
    initialize: function () {
      this.template = _.template($(".movie-item-template").html());
    },
    render: function () {
      this.model = this.model.toJSON();
      this.model.genres = [];
      if (this.model.genre_fks)
        this.model.genre_fks.map((ele) => {
          this.model.genres.push(genres[ele]);
        });
      this.$el.html(this.template(this.model));
      return this;
    },
  });

  let MoviesListView = Backbone.View.extend({
    model: movies,
    el: $(".movies-list"),
    initialize: function () {
      this.model.on("add", this.render, this);
      this.model.fetch({
        // initializes the View by doing an AJAX call. Note that even though nothing is being done to the data in `success` and `error` apart from merely console logging , the data is stored
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
      let self = this;
      this.$el.html(""); // clears the html before each re-render
      _.each(this.model.toArray(), function (movie) {
        self.$el.append(new MovieItemView({ model: movie }).render().$el);
      });
      return this;
    },
  });

  let moviesListView = new MoviesListView();

  // Backbone App setup here
});
