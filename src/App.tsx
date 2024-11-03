import { TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { ModeToggle } from './components/theming/mode-toggle'
import { ThemeProvider } from './components/theming/theme-provider'
import { Button } from './components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Tabs, TabsContent } from './components/ui/tabs'
import usePeer from './hooks/usePeer'
import { Check, ClipboardCopy, X as CloseIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react'
import { cn } from './lib/utils'


function App() {
  
  const {connected, setConnected, temporary, disconnect, localStream, remoteStream, createOffer, createAnswer, addAnswer} = usePeer();
  
  const [offer, setOffer] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  const [tab, setTab] = useState<string>("offer");
  
  function resetAndDisconnect() {
    disconnect();
    setOffer("");
    setAnswer("");
  }

  const [copied, setCopied] = useState<boolean>(false);
  const [contain, setContain] = useState<boolean>(false);

  function handleCopy(inputValue: string) {
    if (inputValue) {
      navigator.clipboard.writeText(inputValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const localVideoFeed = useRef<HTMLVideoElement>(null);
  const remoteVideoFeed = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (localVideoFeed.current) {
      localVideoFeed.current.srcObject = localStream;
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoFeed.current) {
      remoteVideoFeed.current.srcObject = remoteStream;
    }
  }, [remoteStream, connected])

  function ControlCenter() {
    return (
      <Tabs value={tab} onValueChange={setTab} className='w-full'>
        { temporary && <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1"
        onClick={() => setConnected(true)}
        >
          <CloseIcon className='h-4 w-4'/>
        </Button>}
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value='offer'>Offer</TabsTrigger>
          <TabsTrigger value='answer'>Answer</TabsTrigger>
        </TabsList>
        <TabsContent value='offer'>
          <Card>
            <CardHeader>
              <CardTitle>Invite a friend</CardTitle>
              <div className="relative">
                <Input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder='Generate or paste an offer'/>
                <Button type="button" variant="ghost" size="icon" className={cn( "bg-background absolute right-0 top-0 h-full px-3 py-2", copied && "text-green-500")}
                  onClick={() => handleCopy(offer)} disabled={!offer} >
                  {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  <span className="sr-only">Copy to clipboard</span>
                </Button>
              </div>
              <CardDescription>Create an offer to invite someone</CardDescription>
              <Button onClick={(e) => {
                e.preventDefault();
                createOffer((value) => setOffer(JSON.stringify(value)))}
              }>Generate Offer</Button>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value='answer'>
          <Card>
            <CardHeader>
              <CardTitle>Join an invite</CardTitle>
              <div className="relative">
                <Input value={answer} onChange={(e) => setAnswer(e.target.value)}  placeholder='Generate or paste an answer'/>
                <Button type="button" variant="ghost" size="icon" className={cn( "bg-background absolute right-0 top-0 h-full px-3 py-2", copied && "text-green-500")}
                  onClick={() => handleCopy(answer)} disabled={!answer} >
                  {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  <span className="sr-only">Copy to clipboard</span>
                </Button>
              </div>
              <CardDescription>Create an answer to verify invite</CardDescription>
              <Button onClick={(e) => {
                e.preventDefault();
                createAnswer(JSON.parse(offer), (value) => setAnswer(JSON.stringify(value)))
              } }>Generate Answer</Button>
              <Button onClick={() => addAnswer(JSON.parse(answer))}>Set Answer</Button>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    )
  }
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="w-full h-screen">

        <video ref={remoteVideoFeed} id='local-video' className='w-full h-full' muted loop autoPlay playsInline
          style={{ objectFit: contain ? "contain": "cover" }}
          src='https://videos.pexels.com/video-files/20594036/20594036-hd_1920_1080_25fps.mp4'
        ></video>

        <div className="absolute bottom-5 right-5 w-[20vw] h-[20vh] rounded-lg overflow-hidden">
          <video ref={localVideoFeed} id='local-video' className='w-full h-full object-cover' muted loop autoPlay playsInline
            src='https://videos.pexels.com/video-files/20530134/20530134-hd_1920_1080_25fps.mp4'
          ></video>
        </div>

        { !connected &&  <Card className='w-[25em] max-w-[90vw] absolute bottom-5 left-5 pt-3'>
          <ControlCenter/>
        </Card> }

        {connected && <Button className='absolute bottom-5 left-[50%] translate-x-[-50%]'
          variant="destructive" onClick={resetAndDisconnect}>Disconnect</Button>}

        <div className="absolute top-3 right-3">
          <ModeToggle></ModeToggle> 
        </div>

        <div className="absolute top-3 right-14">
          <Button variant="outline" size="icon" onClick={() => setContain(!contain)}>
            { contain ? <MinimizeIcon/> : <MaximizeIcon/>}
          </Button>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
