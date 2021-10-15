let genres_hash = {};
const fetchGenres = async () => {
  const response = await fetch("http://localhost:3000/genres");
  const data = await response.json();
  data.map((ele) => {
    genres_hash[ele.pk] = ele.name;
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
    update: function () {
      this.model.set("name", $(".name-update").val());
      this.model.save({
        success: function (response) {
          console.log(response);
        },
        error: function () {
          throw new Error();
        },
      });
    },
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
      this.$el.html(
        this.template({
          name: this.model.toJSON().name,
          genres_hash: genres_hash,
          genre_fks: this.model.get("genre_fks") || [],
        })
      );
      return this;
    },
  });

  let MoviesListView = Backbone.View.extend({
    coll: movies,
    el: $(".movies-list"),
    initialize: async function () {
      this.coll.on("sync", this.render, this);
      await fetchGenres();
      this.coll.fetch({
        success: function (response) {
          _.each(response.toJSON(), function (movie) {
            console.log("Successfully GOT movie: " + movie.name);
          });
        },
        error: function () {
          throw new Error();
        },
      });
    },
    render: function () {
      let that = this;
      this.$el.html(""); // clears the html before each re-render
      _.each(this.coll.toArray(), function (movie) {
        that.$el.append(new MovieItemView({ model: movie }).render().$el);
      });
      return this;
    },
  });

  let moviesListView = new MoviesListView();

  $(".add-movie").on("click", function () {
    var movie = new Movie({
      name: $(".name-input").val(),
      genres: $(".genre-input").val(),
    });
    movies.add(movie);
    movie.save({
      success: function () {
        $(".name-input").val("");
      },
      error: function () {
        throw new Error();
      },
    });
  });
});
