import React from 'react';
import Avatar from './Avatar';

const AvatarDemo = () => {
  const users = [
    { name: 'John Doe', size: 'md' },
    { name: 'Jane Smith', size: 'lg' },
    { name: 'Alice Johnson', size: 'sm' },
    { name: 'Bob Wilson', size: 'xl' },
    { name: 'Charlie Brown', size: 'xs' },
    { name: 'David Lee', size: '2xl' }
  ];

  const colorSchemes = [
    { name: 'Auto (John Doe)', fallback: 'John Doe', colorScheme: 'auto' },
    { name: 'Blue (Jane Smith)', fallback: 'Jane Smith', colorScheme: 'blue' },
    { name: 'Purple (Alice Johnson)', fallback: 'Alice Johnson', colorScheme: 'purple' },
    { name: 'Green (Bob Wilson)', fallback: 'Bob Wilson', colorScheme: 'green' },
    { name: 'Orange (Charlie Brown)', fallback: 'Charlie Brown', colorScheme: 'orange' },
    { name: 'Pink (David Lee)', fallback: 'David Lee', colorScheme: 'pink' }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Avatar Component Demo</h1>
        
        {/* Sizes Demo */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Different Sizes</h2>
          <div className="flex items-center space-x-6">
            {users.map((user, index) => (
              <div key={index} className="text-center">
                <Avatar 
                  fallback={user.name} 
                  size={user.size}
                />
                <p className="text-sm text-gray-600 mt-2">{user.size}</p>
                <p className="text-xs text-gray-500">{user.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Color Schemes Demo */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Color Schemes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {colorSchemes.map((user, index) => (
              <div key={index} className="text-center">
                <Avatar 
                  fallback={user.fallback} 
                  colorScheme={user.colorScheme}
                  size="lg"
                />
                <p className="text-sm text-gray-600 mt-2">{user.name}</p>
                <p className="text-xs text-gray-500">{user.fallback}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Online Status Demo */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Online Status</h2>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <Avatar 
                fallback="Alice Johnson" 
                colorScheme="purple"
                online={false}
              />
              <p className="text-sm text-gray-600 mt-2">Offline</p>
            </div>
            <div className="text-center">
              <Avatar 
                fallback="Bob Wilson" 
                colorScheme="green"
                online={true}
              />
              <p className="text-sm text-gray-600 mt-2">Online</p>
            </div>
            <div className="text-center">
              <Avatar 
                fallback="Charlie Brown" 
                colorScheme="orange"
                online={true}
                size="xl"
              />
              <p className="text-sm text-gray-600 mt-2">Online (Large)</p>
            </div>
          </div>
        </section>

        {/* Single Initial Demo */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Single Initials</h2>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <Avatar 
                fallback="A" 
                colorScheme="blue"
                size="lg"
              />
              <p className="text-sm text-gray-600 mt-2">Single Initial "A"</p>
            </div>
            <div className="text-center">
              <Avatar 
                fallback="?" 
                colorScheme="gray"
                size="lg"
              />
              <p className="text-sm text-gray-600 mt-2">Unknown User</p>
            </div>
          </div>
        </section>

        {/* Usage Code Example */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Usage Examples</h2>
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`import Avatar from './components/ui/Avatar';

// Basic usage with initials
<Avatar fallback="John Doe" />

// With custom size
<Avatar fallback="Jane Smith" size="lg" />

// With specific color scheme
<Avatar fallback="Alice Johnson" colorScheme="purple" />

// With online status
<Avatar fallback="Bob Wilson" online={true} />

// With profile image (falls back to initials)
<Avatar src="/profile.jpg" fallback="Charlie Brown" />`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AvatarDemo;
