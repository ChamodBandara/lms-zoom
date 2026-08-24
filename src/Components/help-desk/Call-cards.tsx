import { PhoneCall, MessageCircle } from 'lucide-react';

const hotlines = [
  {
    id: 1,
    title: 'Hotline 01',
    hotline: '+9470 666 7051',
    description: 'Website සම්බන්ධ ගැටලු සහ Live Classes, Repeat Classes, Recording සම්බන්ධ ගැටලු Hotline 01 මඟින් නිරාකරණය කරගත හැක.',
    whatsapp: '+94706667051',
    telegram: 'ujithsirhotline01',
  },
  {
    id: 2,
    title: 'Hotline 02',
    hotline: '+9470 666 7052',
    description: 'All Island සහ භෞතික පන්ති පිළිබඳ විස්තර හෝ වෙනත් ඕනෑම ගැටලුවක් Hotline 02 මඟින් නිරාකරණය කරගත හැක',
    whatsapp: '+94706667052',
    telegram: 'ujithsirhotline02',
  },
];

function CallCards() {
  return (
    <div className="bg-white px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Contact Our Hotline</h2>
          <p className="text-gray-600 text-base">Reach us anytime through multiple channels</p>
        </div>
        <div className="space-y-6">
          {hotlines.map((hotline) => (
            <div 
              key={hotline.id} 
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left Side - Hotline Info */}
                <div className="w-full lg:w-2/3 bg-theme p-4 lg:p-6">
                  <div className="flex items-center mb-3 lg:mb-4 mt-4 lg:mt-8 ml-2 lg:ml-4">
                    <div className="bg-white/20 rounded-full p-2 mr-3">
                      <PhoneCall className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{hotline.title}</h3>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed ml-2 lg:ml-4 font-sinhala">
                    {hotline.description}
                  </p>
                </div>
                {/* Right Side - Contact Methods */}
                <div className="w-full lg:w-1/3 p-3 lg:p-4 flex flex-col gap-2 lg:gap-3">
                  {[
                    { 
                      label: 'WhatsApp', 
                      href: `https://wa.me/${hotline.whatsapp}`, 
                      icon: <MessageCircle className="h-5 w-5 text-green-600" />, 
                      bgColor: 'bg-green-100', 
                      textColor: 'text-green-600' 
                    },
                    { 
                      label: 'Telegram', 
                      href: `https://t.me/${hotline.telegram}`, 
                      icon: <MessageCircle className="h-5 w-5 text-blue-600" />, 
                      bgColor: 'bg-blue-100', 
                      textColor: 'text-blue-600' 
                    },
                    { 
                      label: 'Direct Call', 
                      href: `tel:${hotline.hotline}`, 
                      icon: <PhoneCall className="h-5 w-5 text-purple-600" />, 
                      bgColor: 'bg-purple-100', 
                      textColor: 'text-purple-600' 
                    }
                  ].map((contact, index) => (
                    <a 
                      key={index} 
                      href={contact.href} 
                      className="flex items-center group hover:bg-gray-50 active:bg-gray-100 rounded-lg px-2 lg:px-3 py-2 transition-all duration-200 transform hover:scale-[1.02]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className={`${contact.bgColor} rounded-full p-2 mr-2 lg:mr-3`}>
                        {contact.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm font-medium text-gray-500">{contact.label}</p>
                        <p className={`text-xs lg:text-sm font-semibold text-gray-900 group-hover:${contact.textColor} transition-colors duration-200 truncate`}>
                          {contact.label === 'Telegram' ? `@${hotline.telegram}` : contact.href.replace(/https:\/\/(wa.me|t.me|tel)\//, '')}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CallCards;