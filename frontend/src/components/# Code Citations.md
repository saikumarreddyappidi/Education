````markdown
# Code Citations

## License: MIT
https://github.com/academind/react-complete-guide-code/blob/08-practice-project/code/09-finished/src/components/UI/Search.js

```
// Implementation inspiration for staff note search functionality in Notepad.tsx
// The search functionality with dynamic results display was adapted from this pattern
const Search = props => {
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (enteredFilter === inputRef.current.value) {
        const query =
          enteredFilter.length === 0
            ? ''
            : `?orderBy="title"&equalTo="${enteredFilter}"`;
        fetch(
          'https://react-hooks-update-85e9e.firebaseio.com/ingredients.json' + query
        )
          .then(response => response.json())
          .then(responseData => {
            const loadedIngredients = [];
            for (const key in responseData) {
              loadedIngredients.push({
                id: key,
                title: responseData[key].title,
                amount: responseData[key].amount
              });
            }
            onLoadIngredients(loadedIngredients);
          });
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [enteredFilter, onLoadIngredients, inputRef]);
}
```

## License: MIT
https://github.com/bmcmahen/sancho/blob/master/src/NoteEditor.tsx

```
// Auto-save functionality in Notepad.tsx was inspired by this implementation
// Setup for timed saving with status indicators
useEffect(() => {
  if (
    note &&
    note.id &&
    (note.name !== originalName || note.body !== originalBody)
  ) {
    setStatus("saving");
    const timeout = setTimeout(() => {
      saveNote({
        variables: {
          input: {
            name: note.name,
            body: note.body,
            id: note.id
          }
        }
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }
}, [note, originalBody, originalName, saveNote]);
```

## License: MIT
https://github.com/tailwindlabs/tailwindui-react/blob/main/src/components/Application/SlideOver.jsx

```
// Responsive mobile design for the note list/editor toggle in Notepad.tsx
// Adapted from this pattern of responsive visibility control
export function SlideOver({
  open,
  onClose,
  children,
  title,
  description,
  className,
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden"
        onClose={onClose}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div
                className={clsx(
                  'w-screen max-w-md',
                  className
                )}
              >
                {children}
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
```

## License: unknown
https://github.com/Thef1nansist/NodeJsLabs/blob/18c1ccb687fce87c123b19af26c5d28b8c9948a4/Labs9/09-05.js

```
= http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.
```


## License: unknown
https://github.com/Tedi0re/5-term-pskp/blob/5c49b911fc2138e20813d9f639f7a96090060eb9/lab_7/07-06/07-06.js

```
= http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.
```


## License: MIT
https://github.com/Planxnx/parking-alert/blob/177b24a02e994af85ca4a5eba148d793db3fb411/parking-alert-app/src/pages/Car/component/Loading.tsx

```
:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12"
```


## License: Apache-2.0
https://github.com/nvsriram/solana-account-website/blob/19dc5458e962c7725e22d8acd325fc59de56a447/src/app/components/upload/upload-button.tsx

```
:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12"
```


## License: unknown
https://github.com/fidgeters/cereal-fidget/blob/38d2ae31bcd12e94eb370935632e7a7000481c0a/index.js

```
,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.
```


## License: unknown
https://github.com/Thef1nansist/NodeJsLabs/blob/18c1ccb687fce87c123b19af26c5d28b8c9948a4/Labs9/09-05.js

```
,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.
```


## License: unknown
https://github.com/Tedi0re/5-term-pskp/blob/5c49b911fc2138e20813d9f639f7a96090060eb9/lab_7/07-06/07-06.js

```
,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.
```

