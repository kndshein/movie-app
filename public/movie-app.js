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
      "click .update": "update",
      "click .cancel": "cancel",
      "click .delete": "delete",
    },
    edit: function () {
      this.$(".edit").hide();
      this.$(".delete").hide();
      this.$(".update").show();
      this.$(".cancel").show();

      let name = this.$(".name").html();

      this.$(".name").html(
        '<input type="text" class="form-control name-update" value="' +
          name +
          '">'
      );
    },
    update: function () {},
    cancel: function () {
      moviesListView.render();
      //* This seems to re-render the entire list of movies - perhaps I could use an ID to target the specific item?
    },
    delete: function () {
      this.model.destroy({
        // Backbone.js seems to auto target movie ids based on urlRoot and idAttribute
        success: function (response) {
          console.log(response);
          moviesListView.render();
        },
        error: function () {
          throw new Error();
        },
      });
    },
    render: function () {
      console.log("MovieItemView render count");
      this.model.attributes.genres = [];
      if (this.model.attributes.genre_fks)
        this.model.attributes.genre_fks.map((ele) => {
          this.model.attributes.genres.push(genres[ele]);
        });
      this.$el.html(this.template(this.model.toJSON()));
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
        success: function (response) {
          _.each(response.toJSON(), function (movie) {
            console.log("Successfully GOT movie with _id: " + movie.name);
          });
        },
        error: function () {
          throw new Error();
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
        $(".name-input").val("");
      },
      error: function () {
        throw new Error();
      },
    });
  });
  // Backbone App setup here
});
