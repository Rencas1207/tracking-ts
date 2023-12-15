import { useMemo, useState } from 'react';

import './App.css';
import { SortBy, User } from './types.d';
import UsersList from './components/UsersList';
import { useInfiniteQuery } from "react-query";

const fetchUsers = async ({pageParam = 1}: {pageParam?: number}) => {
  return await fetch(`https://randomuser.me/api/?results=10&seed=rencas&page=${pageParam}`)
      .then(async res => {
        if(!res.ok) throw new Error('Error en la petición')
        return await res.json()
      })
      .then(res => {
        const currentPage = Number(res.info.page);
        const nextCursor = currentPage > 3 ? undefined : currentPage + 1;
        return {
          users: res.results,
          nextCursor
        }
      })
}

function App() {
  const {
    isLoading ,
    isError,
    data,
    refetch,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery<{nextCursor?: number, users: User []}>(['users'],
      fetchUsers,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor
      }
  )

  const users: User [] = data?.pages?.flatMap(page => page.users) ?? [];

  const [showColors, setShowColors] = useState(false);
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE);
  const [filterCountry, setFilterCountry] = useState<string | null>(null);

  const toggleColors = () => {
    setShowColors(!showColors);
  };

  const toggleSortByCountry = () => {
    const newSortingValue =
      sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE;
    setSorting(newSortingValue);
  };

  const handleReset = async () => {
    await refetch();
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
        {!isLoading && !isError && hasNextPage === true && <button onClick={async () => {await fetchNextPage()}}>Cargar más resultados</button>}
      </main>
    </>
  );
}

export default App;
