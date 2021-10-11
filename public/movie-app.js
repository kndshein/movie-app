let genres = {};
const fetchGenres = async () => {
  const response = await fetch("http://localhost:3000/genres");
  const data = await response.json();
  data.map((ele) => {
    genres[ele.pk] = ele.name;
  });
};

let Movie = Backbone.Model.extend({
  urlRoot: "/movies",
  idAttribute: "pk",
  defaults: {
    name: "",
    genre_fks: [],
  },
});

let Movies = Backbone.Collection.extend({
  url: "/movies",
  model: Movie,
});

let movies = new Movies();

$(document).ready(function () {
  let MovieItemView = Backbone.View.extend({
    model: new Movie(),
    tagName: "tr",
    initialize: function () {
      this.template = _.template($(".movie-item-template").html());
    },
    events: {
      "click .edit": "edit",
    },
    edit: function () {
      $(".edit").hide();
      $(".update").show();
      $(".cancel").show();
    },
    cancel: function () {},
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
    initialize: async function () {
      this.model.on("add", this.render, this);
      await fetchGenres();
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

  $(".add-movie").on("click", function () {
    var movie = new Movie({
      name: $(".name-input").val(),
    });
    movies.add(movie);
    movie.save(null, {
      success: function (response) {
        console.log(response);
      },
      error: function () {
        console.log("Add movie unsuccessful.");
      },
    });
  });
  // Backbone App setup here
});
