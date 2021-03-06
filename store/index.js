import Cookie from 'js-cookie';

// export the state as a function
export const state = () => ({
  loadedPosts: [],
  token: null,
})

// mutations and actions as objects
export const mutations = {
  setPosts(state, posts) {
    state.loadedPosts = posts;
  },
  addPost(state, post) {
    state.loadedPosts.push(post);
  },
  editPost(state, editedPost) {
    const postIndex = state.loadedPosts.findIndex(post => post.id === editedPost.id);
    state.loadedPosts[postIndex] = editedPost;
  },
  deletePost(state, deletePost) {
    const postIndex = state.loadedPosts.findIndex(post => post.id === deletePost.id);
    state.loadedPosts.splice(postIndex, 1);
  },
  setToken(state, token) {
    state.token = token;
  },
  clearToken(state) {
    state.token = null;
  }
}

export const actions = {
  nuxtServerInit(vuexContext, context) {
    return context.app.$axios
      .$get('/posts.json')
      .then(data => {
        const postsArray = [];
        for (const key in data) {
          postsArray.push({ ...data[key], id: key });
        }
        vuexContext.commit('setPosts', postsArray);
      })
      .catch(e => context.error(e));
  },
  addPost(vuexContext, post) {
    const createPost = {
      ...post,
      updatedDate: new Date()
    };
    return this.$axios
      .$post('/posts.json?auth=' + vuexContext.state.token, createPost)
      .then((data) => {
        vuexContext.commit('addPost', { ...createPost, id: data.name });
      })
      .catch((e) => console.log(e));
  },
  editPost(vuexContext, editedPost) {
    return this.$axios
      .$put('/posts/' + editedPost.id + '.json?auth=' + vuexContext.state.token, editedPost)
      .then(result => {
        vuexContext.commit('editPost', editedPost);
      })
      .catch((e) => console.log(e));
  },
  deletePost(vuexContext, deletePost) {
    return this.$axios
      .$delete('/posts.json?auth=' + vuexContext.state.token, { id: deletePost.id })
      .then(result => {
        vuexContext.commit('deletePost', deletePost);
      })
  },
  // setPosts(vuexContext, posts) {
  //   conosole.log('setPosts',posts )
  //   vuexContext.commit('setPosts', posts);
  // },
  authenticateUser(vuexContext, authData) {
    let authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
    if (!authData.isLogin) {
      authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
    }

    return this.$axios
      .$post(authUrl + process.env.fbAPIKey, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      })
      .then(result => {
        vuexContext.commit("setToken", result.idToken);
        localStorage.setItem("token", result.idToken);
        localStorage.setItem(
          "tokenExpiration",
          new Date().getTime() + Number.parseInt(result.expiresIn) * 1000
        );
        Cookie.set('jwt', result.idToken);
        Cookie.set('expirationDate', new Date().getTime() + Number.parseInt(result.expiresIn) * 1000);
        return this.$axios.$post('http://localhost:3000/api/track-data', { data: 'Authenticated!' })
      })
      .catch((e) => console.log(e));
  },
  initAuth(vuexContext, req) {
    let token;
    let expirationDate;
    if (req) {
      if (!req.headers.cookie) {
        return;
      }
      const jwtCookie = req.headers.cookie
        .split(';')
        .find(c => c.trim().startsWith('jwt='));
      if (!jwtCookie) return;
      token = jwtCookie.split('=')[1];
      expirationDate = req.headers.cookie
        .split(';')
        .find(c => c.trim().startsWith('expirationDate='))
        .split('=')[1];
    } else {
      token = localStorage.getItem('token');
      expirationDate = localStorage.getItem('tokenExpiration');
    }

    if (new Date().getTime() > Number.parseInt(expirationDate) || !token) {
      vuexContext.dispatch("logout");
      return;
    }

    vuexContext.commit("setToken", token);
  },
  logout(vuexContext) {
    vuexContext.commit("clearToken");
    Cookie.remove("jwt");
    Cookie.remove("expirationDate");
    // if (process.client) {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    // }
  }
}

export const getters = {
  loadedPosts(state) {
    return state.loadedPosts;
  },
  isAuthenticated(state) {
    return state.token != null;
  },
}
