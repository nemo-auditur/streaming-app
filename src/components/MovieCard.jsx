import React, { useReducer } from "react";
import { AiFillLike } from "react-icons/ai";
import { BsPlusCircle, BsCheckLg } from "react-icons/bs";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { arrayUnion, arrayRemove, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { RiMovie2Fill } from "react-icons/ri";
import { IoTrashBinSharp } from "react-icons/io5";
import { GrClose } from "react-icons/gr";
import "react-toastify/dist/ReactToastify.css";

const initialState = {
  like: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LIKE":
      return { ...state, like: action.payload };
    case "SET_SAVING":
      return { ...state, saving: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

const MovieCard = ({ movie, onClick }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { user } = UserAuth();

  const addMovieNotify = () =>
    toast.success(
      `${movie.title} a été ajouté à votre liste !`,
      { icon: RiMovie2Fill },
      { toastId: movie.id }
    );
  const removeMovieNotify = () =>
    toast.info(
      `${movie.title} a été retiré de votre liste ! `,
      { icon: IoTrashBinSharp },
      { toastId: movie.id }
    );
  const messageCreateAccountNotify = () => {
    toast.error(
      "Vous devez vous connecter ou créer un compte pour ajouter un film à vos favoris",
      { icon: GrClose },

      {
        autoClose: 5000,

        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );
  };
  const movieId = doc(db, `users`, `${user?.email}`);
  const saveMovie = async () => {
    if (user?.email) {
      // if user is logged in

      if (state.like) {
        await updateDoc(movieId, {
          savedMovies: arrayRemove({
            id: movie.id,
            title: movie.title,
            backdrop_path: movie.backdrop_path,
            vote_average: movie.vote_average,
          }),
        });
        dispatch({ type: "SET_LIKE", payload: false });
        removeMovieNotify();
      } else {
        await updateDoc(movieId, {
          savedMovies: arrayUnion({
            id: movie.id,
            title: movie.title,
            backdrop_path: movie.backdrop_path,
            vote_average: movie.vote_average,
          }),
        });
        dispatch({ type: "SET_LIKE", payload: true });
        addMovieNotify();
      }
    } else {
      // if user is not logged in
      messageCreateAccountNotify();
    }
  };

  return (
    <div
      className="  text-transparent relative flex-none w-80  mx-1 rounded-lg  object-cover shadow-md transition duration-500 ease-in-out transform hover:scale-125 hover:z-30  hover:text-white
    "
    >
      {movie.backdrop_path ? (
        <img
          onClick={onClick}
          src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
          alt={`${movie.title}`}
        />
      ) : (
        <span className="text-white">No poster available</span>
      )}

      <div className="absolute bottom-4 left-10">
        <h2>{movie.title}</h2>
        <div className="flex items-center ">
          <AiFillLike /> <p>{movie.vote_average}</p>
        </div>
      </div>
      <div onClick={saveMovie} className="absolute text-xl right-10 bottom-6">
        {state.like ? <BsPlusCircle /> : <BsCheckLg />}
      </div>
    </div>
  );
};

export default MovieCard;
