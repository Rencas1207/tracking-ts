import { useEffect, useMemo, useRef, useState } from 'react';

import './App.css';
import { SortBy, User } from './types.d';
import UsersList from './components/UsersList';
import { useQuery } from "react-query";

const fetchUsers = async (page: number) => {
  return await fetch(`https://randomuser.me/api/?results=10&seed=rencas&page=${page}`)
      .then(async res => {
        if(!res.ok) throw new Error('Error en la petición')
        return await res.json()
      })
      .then(res => res.results)
}

function App() {
  const {isLoading , isError, data: users = [] } = useQuery<User []>(['users'], async () => await  fetchUsers(1))


  // const [users, setUsers] = useState<User[]>([]);
  const [showColors, setShowColors] = useState(false);
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE);
  const [filterCountry, setFilterCountry] = useState<string | null>(null);

  // const originalUsers = useRef<User[]>([]);

  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const toggleColors = () => {
    setShowColors(!showColors);
  };

  const toggleSortByCountry = () => {
    const newSortingValue =
      sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE;
    setSorting(newSortingValue);
  };

  const handleReset = () => {
    // setUsers(originalUsers.current);
  };

  const handleDelete = (email: string) => {
    // const filteredUsers = users.filter((user) => user.email !== email);
    // setUsers(filteredUsers);
  };

  const handleChangeSort = (sort: SortBy) => {
    setSorting(sort);
  };



  const filteredUsers = useMemo(() => {
    return typeof filterCountry === 'string' && filterCountry.length > 0
      ? users.filter((user) => {
          return user.location.country
            .toLowerCase()
            .includes(filterCountry.toLowerCase());
        })
      : users;
  }, [users, filterCountry]);

  const sortedUsers = useMemo(() => {
    if (sorting === SortBy.NONE) return filteredUsers;

    const compareProperties: Record<string, (user: User) => any> = {
      [SortBy.COUNTRY]: (user) => user.location.country,
      [SortBy.NAME]: (user) => user.name.first,
      [SortBy.LAST]: (user) => user.name.last,
    };

    return filteredUsers.toSorted((a, b) => {
      const extractProperty = compareProperties[sorting];
      return extractProperty(a).localeCompare(extractProperty(b));
    });
  }, [filteredUsers, sorting]);

  return (
    <>
      <h1>Prueba técnica</h1>
      <header>
        <button onClick={toggleColors}>Colorear files</button>
        <button onClick={toggleSortByCountry}>
          {sorting === SortBy.COUNTRY
            ? 'No ordenar por país'
            : 'Ordenar por país'}
        </button>
        <button onClick={handleReset}>Resetear estado inicial</button>
        <input
          type="text"
          placeholder="Filtra por país"
          onChange={(e) => {
            setFilterCountry(e.target.value);
          }}
        />
      </header>
      <main>
        {users.length > 0 && <UsersList
                showColors={showColors}
                users={sortedUsers}
                deleteUser={handleDelete}
                changeSorting={handleChangeSort}
            />}
        {isLoading && <p>Cargando...</p>}
        {isError && <p>Ha habido un error...</p>}
        {!isLoading && !isError && users.length === 0 && <p>No hay usuarios</p>}
        {!isLoading && !isError && <button onClick={() => setCurrentPage(currentPage + 1)}>Cargar más resultados</button>}
      </main>
    </>
  );
}

export default App;
