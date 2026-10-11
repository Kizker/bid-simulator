(()=>{var a={};a.id=806,a.ids=[806],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},2249:(a,b,c)=>{"use strict";c.r(b),c.d(b,{appSettings:()=>l,auctionRooms:()=>h,bids:()=>i,botProfiles:()=>m,simulationConfigs:()=>j,users:()=>k});var d=c(19528),e=c(83142),f=c(33015),g=c(538);let h=(0,d.cJ)("auction_rooms",{id:(0,e.Qq)("id").primaryKey(),title:(0,e.Qq)("title").notNull(),description:(0,e.Qq)("description").notNull(),category:(0,e.Qq)("category").notNull().default("Handphone"),subtitle:(0,e.Qq)("subtitle").notNull().default(""),lotBadge:(0,e.Qq)("lot_badge").notNull().default("(AD) STANDART"),condition:(0,e.Qq)("condition").notNull().default("Fullset"),stock:(0,f.nd)("stock").notNull().default(1),specs:(0,e.Qq)("specs").notNull().default(""),imageUrl:(0,e.Qq)("image_url").notNull(),startingPrice:(0,g.o)("starting_price",{mode:"number"}).notNull(),currentPrice:(0,g.o)("current_price",{mode:"number"}).notNull(),bidIncrement:(0,f.nd)("bid_increment").notNull().default(2e4),reservePrice:(0,g.o)("reserve_price",{mode:"number"}).notNull().default(0),status:(0,e.Qq)("status",{enum:["DRAFT","UPCOMING","ACTIVE","PAUSED","ENDED"]}).notNull().default("ACTIVE"),totalDurationSeconds:(0,f.nd)("total_duration_seconds").notNull().default(45240),timeRemaining:(0,f.nd)("time_remaining").notNull().default(45240),antiSnipingSeconds:(0,f.nd)("anti_sniping_seconds").notNull().default(15),highestBidderName:(0,e.Qq)("highest_bidder_name"),highestBidderType:(0,e.Qq)("highest_bidder_type",{enum:["USER","BOT"]}),totalBids:(0,f.nd)("total_bids").notNull().default(0),createdAt:(0,g.o)("created_at",{mode:"number"}).notNull(),updatedAt:(0,g.o)("updated_at",{mode:"number"}).notNull()}),i=(0,d.cJ)("bids",{id:(0,e.Qq)("id").primaryKey(),roomId:(0,e.Qq)("room_id").notNull().references(()=>h.id,{onDelete:"cascade"}),bidderName:(0,e.Qq)("bidder_name").notNull(),bidderType:(0,e.Qq)("bidder_type",{enum:["USER","BOT"]}).notNull().default("USER"),amount:(0,g.o)("amount",{mode:"number"}).notNull(),previousAmount:(0,g.o)("previous_amount",{mode:"number"}).notNull().default(0),status:(0,e.Qq)("status",{enum:["WINNING","OUTBID","WON"]}).notNull().default("WINNING"),createdAt:(0,g.o)("created_at",{mode:"number"}).notNull()}),j=(0,d.cJ)("simulation_configs",{roomId:(0,e.Qq)("room_id").primaryKey().references(()=>h.id,{onDelete:"cascade"}),botEnabled:(0,f.nd)("bot_enabled").notNull().default(1),botCount:(0,f.nd)("bot_count").notNull().default(4),botAggressiveness:(0,e.Qq)("bot_aggressiveness",{enum:["LOW","MEDIUM","HIGH","CHAOS"]}).notNull().default("MEDIUM"),botMinDelayMs:(0,f.nd)("bot_min_delay_ms").notNull().default(1500),botMaxDelayMs:(0,f.nd)("bot_max_delay_ms").notNull().default(4500),antiSnipingEnabled:(0,f.nd)("anti_sniping_enabled").notNull().default(1)}),k=(0,d.cJ)("users",{id:(0,e.Qq)("id").primaryKey(),name:(0,e.Qq)("name").notNull(),phone:(0,e.Qq)("phone").notNull().unique(),email:(0,e.Qq)("email"),city:(0,e.Qq)("city").default("Jakarta"),createdAt:(0,g.o)("created_at",{mode:"number"}).notNull(),updatedAt:(0,g.o)("updated_at",{mode:"number"}).notNull()}),l=(0,d.cJ)("app_settings",{key:(0,e.Qq)("key").primaryKey(),value:(0,e.Qq)("value").notNull(),updatedAt:(0,g.o)("updated_at",{mode:"number"}).notNull()}),m=(0,d.cJ)("bot_profiles",{id:(0,e.Qq)("id").primaryKey(),name:(0,e.Qq)("name").notNull(),personality:(0,e.Qq)("personality",{enum:["AGGRESSIVE","SNIPER","CASUAL","CONSERVATIVE","ERRATIC"]}).notNull().default("CASUAL"),avatarUrl:(0,e.Qq)("avatar_url"),minDelaySec:(0,f.nd)("min_delay_sec").notNull().default(2),maxDelaySec:(0,f.nd)("max_delay_sec").notNull().default(5),maxBudget:(0,g.o)("max_budget",{mode:"number"}).notNull().default(0),isActive:(0,f.nd)("is_active").notNull().default(1),createdAt:(0,g.o)("created_at",{mode:"number"}).notNull(),updatedAt:(0,g.o)("updated_at",{mode:"number"}).notNull()})},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8128:a=>{"use strict";a.exports=require("next/dist/server/runtime-reacts.external.js")},9593:()=>{},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13917:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>A,patchFetch:()=>z,routeModule:()=>v,serverHooks:()=>y,workAsyncStorage:()=>w,workUnitAsyncStorage:()=>x});var d=c(98103),e=c(70736),f=c(82415),g=c(52855),h=c(11729),i=c(66313),j=c(261),k=c(5843),l=c(29565),m=c(18095),n=c(81100),o=c(83354),p=c(90096),q=c(76146),r=c(49815),s=c(86439),t=c(84608),u=c(65357);let v=new d.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/api/bids/route",pathname:"/api/bids",filename:"route",bundlePath:"app/api/bids/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/andrichadeamitra/Documents/PROJECT/bid-simulator/src/app/api/bids/route.ts",nextConfigOutput:"",userland:()=>c(73650),...{}}),{workAsyncStorage:w,workUnitAsyncStorage:x,serverHooks:y}=v;function z(){return(0,f.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:x})}async function A(a,b,c){c.requestMeta&&(0,g.setRequestMeta)(a,c.requestMeta),v.isDev&&(0,g.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/bids/route";"/index"===d&&(d="/");let f=await v.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!f)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:w,deploymentId:x,params:y,nextConfig:z,parsedUrl:A,isDraftMode:B,prerenderManifest:C,routerServerContext:D,isOnDemandRevalidate:E,revalidateOnlyGenerated:F,resolvedPathname:G,clientReferenceManifest:H,serverActionsManifest:I}=f,J=(0,j.normalizeAppPath)(d),K=!!C.routes[G]&&(v.isDev||(0,t.isRouteCacheOwner)(G,v.cacheOwner,C.routes[G])),L=!!(C.dynamicRoutes[J]||K),M=async()=>((null==D?void 0:D.render404)?await D.render404(a,b,A,!1):b.end("This page could not be found"),null);if(L&&!B){let a=C.dynamicRoutes[J];if(a&&!1===a.fallback&&!K){if(z.adapterPath)return await M();throw new s.NoFallbackError}}let N=null;!L||v.isDev||B||(N="/index"===(N=G)?"/":N);let O=!0===v.isDev||!L,P=L&&!O;I&&H&&(0,i.setManifestsSingleton)({page:d,clientReferenceManifest:H,serverActionsManifest:I});let Q=a.method||"GET",R=(0,h.getTracer)(),S=R.getActiveScopeSpan(),T=!!(null==D?void 0:D.isWrappedByNextServer),U=!!(0,g.getRequestMeta)(a,"minimalMode"),V=(0,g.getRequestMeta)(a,"incrementalCache")||await v.getIncrementalCache(a,z,C,U);null==V||V.resetRequestCache(),globalThis.__incrementalCache=V;let W={params:y,previewProps:C.preview,renderOpts:{experimental:{authInterrupts:!!z.experimental.authInterrupts,useCacheTimeout:z.experimental.useCacheTimeout},cacheComponents:!!z.cacheComponents,validationLevel:z.experimental.instantInsights.validationLevel,isDraftMode:B,supportsDynamicResponse:O,incrementalCache:V,hmrRefreshHash:(0,g.getRequestMeta)(a,"hmrRefreshHash"),cacheLifeProfiles:z.cacheLife,staticPageGenerationTimeout:z.staticPageGenerationTimeout,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>v.onRequestError(a,b,d,e,D)},sharedContext:{buildId:w,deploymentId:x}},X=new k.NodeNextRequest(a),Y=new k.NodeNextResponse(b),Z=l.NextRequestAdapter.fromNodeNextRequest(X,(0,l.signalFromNodeResponse)(b)),$=async({previousCacheEntry:e})=>{try{if(!U&&E&&F&&!e)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await v.handle(Z,W);a.fetchMetrics=W.renderOpts.fetchMetrics;let f=W.renderOpts.pendingWaitUntil;f&&c.waitUntil&&(c.waitUntil(f),f=void 0);let g=W.renderOpts.collectedTags;if(!L)return await (0,o.I)(X,Y,d,f),null;{let a=await d.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(d.headers);g&&(b[r.NEXT_CACHE_TAGS_HEADER]=g),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==W.renderOpts.collectedRevalidate&&!(W.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&W.renderOpts.collectedRevalidate,e=void 0===W.renderOpts.collectedExpire||W.renderOpts.collectedExpire>=r.INFINITE_CACHE?!1!==c&&c>0?z.expireTime:void 0:W.renderOpts.collectedExpire;return{value:{kind:u.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==e?void 0:e.isStale)&&await v.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:E})},!1,D),b}},_=async(d,f)=>{try{var g,i;let d=await v.handleResponse({req:a,nextConfig:z,cacheKey:N,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:E,revalidateOnlyGenerated:F,responseGenerator:$,waitUntil:c.waitUntil,isMinimalMode:U});if(!L)return;if((null==d||null==(g=d.value)?void 0:g.kind)!==u.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});U||b.setHeader("x-nextjs-cache",E?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),B&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);U&&L||f.delete(r.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||b.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,q.getCacheControlHeader)(d.cacheControl)),await (0,o.I)(X,Y,new Response(d.value.body,{headers:f,status:d.value.status||200}));return}catch(b){if(b instanceof s.NoFallbackError||await v.onRequestError(a,b,{routerKind:"App Router",routePath:J,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:E})},!1,D),L)throw b;await (0,o.I)(X,Y,new Response(null,{status:500}));return}finally{(()=>{if(!d)return;let a=b.statusCode;d.setAttributes({"http.status_code":a,"next.rsc":!1}),a&&a>=500&&(d.setStatus({code:h.SpanStatusCode.ERROR}),d.setAttribute("error.type",a.toString()));let c=R.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==m.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route")||J,g=`${Q} ${e}`;d.setAttributes({"next.route":e,"http.route":e,"next.span_name":g}),d.updateName(g),f&&f!==d&&(f.setAttribute("http.route",e),f.updateName(g))})()}};if(T&&S)await _(S,void 0);else{let b=R.getActiveScopeSpan();await R.withPropagatedContext(a.headers,()=>R.trace(m.BaseServerSpan.handleRequest,{spanName:`${Q} ${d}`,kind:h.SpanKind.SERVER,attributes:{"http.method":Q,"http.target":a.url}},a=>_(a,b)),void 0,!T)}}},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},38969:()=>{},41220:(a,b,c)=>{"use strict";c.d(b,{Vr:()=>j,db:()=>i});var d=c(45170),e=c(72163),f=c(2249);if("function"==typeof process.loadEnvFile)try{process.loadEnvFile()}catch{}let g=process.env.DATABASE_URL||"postgres://bid_user:bid_secure_pass123@localhost:5432/bid_simulator",h=(0,e.A)(g,{max:parseInt(process.env.DB_MAX_CONNECTIONS||"20",10),idle_timeout:30,connect_timeout:10,onnotice:()=>{}}),i=(0,d.f)(h,{schema:f}),j=(async()=>{if("phase-production-build"!==process.env.NEXT_PHASE)try{await h`
      CREATE TABLE IF NOT EXISTS auction_rooms (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL DEFAULT '',
        lot_badge TEXT NOT NULL DEFAULT '(AD) STANDART',
        condition TEXT NOT NULL DEFAULT 'Fullset',
        stock INTEGER NOT NULL DEFAULT 1,
        specs TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Handphone',
        image_url TEXT NOT NULL,
        starting_price BIGINT NOT NULL,
        current_price BIGINT NOT NULL,
        bid_increment INTEGER NOT NULL DEFAULT 50000,
        reserve_price BIGINT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        total_duration_seconds INTEGER NOT NULL DEFAULT 45240,
        time_remaining INTEGER NOT NULL DEFAULT 45240,
        anti_sniping_seconds INTEGER NOT NULL DEFAULT 15,
        highest_bidder_name TEXT,
        highest_bidder_type TEXT,
        total_bids INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `,await h`
      CREATE TABLE IF NOT EXISTS bids (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL REFERENCES auction_rooms(id) ON DELETE CASCADE,
        bidder_name TEXT NOT NULL,
        bidder_type TEXT NOT NULL DEFAULT 'USER',
        amount BIGINT NOT NULL,
        previous_amount BIGINT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'WINNING',
        created_at BIGINT NOT NULL
      );
    `,await h`
      CREATE TABLE IF NOT EXISTS simulation_configs (
        room_id TEXT PRIMARY KEY REFERENCES auction_rooms(id) ON DELETE CASCADE,
        bot_enabled INTEGER NOT NULL DEFAULT 1,
        bot_count INTEGER NOT NULL DEFAULT 4,
        bot_aggressiveness TEXT NOT NULL DEFAULT 'MEDIUM',
        bot_min_delay_ms INTEGER NOT NULL DEFAULT 2000,
        bot_max_delay_ms INTEGER NOT NULL DEFAULT 5000,
        anti_sniping_enabled INTEGER NOT NULL DEFAULT 1
      );
    `,await h`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT,
        city TEXT DEFAULT 'Jakarta',
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;let a=await h`
      SELECT id FROM users WHERE phone = '81373827173' LIMIT 1
    `,b=Date.now();0===a.length?await h`
        INSERT INTO users (id, name, phone, email, city, created_at, updated_at)
        VALUES ('usr-demo-1', 'Menik Sri Rejeki', '81373827173', 'menikbda@gmail.com', 'Jakarta', ${b}, ${b})
        ON CONFLICT (phone) DO UPDATE
        SET name = EXCLUDED.name, email = EXCLUDED.email;
      `:await h`
        UPDATE users SET name = 'Menik Sri Rejeki', email = 'menikbda@gmail.com' WHERE phone = '81373827173';
      `,await h`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;let c=await h`
      SELECT key FROM app_settings WHERE key = 'session_start_time' LIMIT 1
    `;0===c.length&&await h`
        INSERT INTO app_settings (key, value, updated_at) VALUES
          ('session_start_time', '00:00:00', ${b}),
          ('session_end_time', '23:59:59', ${b}),
          ('session_auto_sync', '1', ${b})
        ON CONFLICT (key) DO NOTHING;
      `,await h`UPDATE app_settings SET value = '00:00:00' WHERE key = 'session_start_time'`,await h`UPDATE app_settings SET value = '23:59:59' WHERE key = 'session_end_time'`,await h`
      UPDATE auction_rooms
      SET status = 'ACTIVE', time_remaining = 36000, total_duration_seconds = 36000
      WHERE status = 'UPCOMING' OR time_remaining <= 0
    `,await h`
      CREATE TABLE IF NOT EXISTS bot_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        personality TEXT NOT NULL DEFAULT 'CASUAL',
        avatar_url TEXT,
        min_delay_sec INTEGER NOT NULL DEFAULT 2,
        max_delay_sec INTEGER NOT NULL DEFAULT 5,
        max_budget BIGINT NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;let d=await h`SELECT count(*) as count FROM bot_profiles`,e=Number(d[0]?.count||0);if(0===e)for(let a of[{id:"bot-1",name:"+62858...",personality:"AGGRESSIVE",minDelaySec:1,maxDelaySec:3,maxBudget:0,isActive:1},{id:"bot-2",name:"+62821...",personality:"SNIPER",minDelaySec:1,maxDelaySec:3,maxBudget:0,isActive:1},{id:"bot-3",name:"+62857...",personality:"CASUAL",minDelaySec:3,maxDelaySec:6,maxBudget:0,isActive:1},{id:"bot-4",name:"+62813...",personality:"CONSERVATIVE",minDelaySec:2,maxDelaySec:5,maxBudget:25e6,isActive:1},{id:"bot-5",name:"+62896...",personality:"ERRATIC",minDelaySec:1,maxDelaySec:7,maxBudget:0,isActive:1},{id:"bot-6",name:"+62878...",personality:"AGGRESSIVE",minDelaySec:1,maxDelaySec:3,maxBudget:0,isActive:1},{id:"bot-7",name:"+62852...",personality:"SNIPER",minDelaySec:1,maxDelaySec:2,maxBudget:0,isActive:1}])await h`
          INSERT INTO bot_profiles (id, name, personality, min_delay_sec, max_delay_sec, max_budget, is_active, created_at, updated_at)
          VALUES (${a.id}, ${a.name}, ${a.personality}, ${a.minDelaySec}, ${a.maxDelaySec}, ${a.maxBudget}, ${a.isActive}, ${b}, ${b})
          ON CONFLICT (id) DO NOTHING;
        `}catch(a){console.warn("Database initialization warning (will retry on query if starting up):",a)}})()},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},73650:(a,b,c)=>{"use strict";c.r(b),c.d(b,{GET:()=>i});var d=c(66246),e=c(41220),f=c(2249),g=c(61658),h=c(39296);async function i(a){try{let{searchParams:b}=new URL(a.url),c=b.get("roomId"),i=Math.min(100,Math.max(1,Number(b.get("limit")||50)));if(c){let a=await e.db.select({id:f.bids.id,roomId:f.bids.roomId,bidderName:f.bids.bidderName,bidderType:f.bids.bidderType,amount:f.bids.amount,previousAmount:f.bids.previousAmount,status:f.bids.status,createdAt:f.bids.createdAt,roomTitle:f.auctionRooms.title}).from(f.bids).leftJoin(f.auctionRooms,(0,g.eq)(f.bids.roomId,f.auctionRooms.id)).where((0,g.eq)(f.bids.roomId,c)).orderBy((0,h.i)(f.bids.createdAt)).limit(i);return d.NextResponse.json({success:!0,bids:a})}let j=await e.db.select({id:f.bids.id,roomId:f.bids.roomId,bidderName:f.bids.bidderName,bidderType:f.bids.bidderType,amount:f.bids.amount,previousAmount:f.bids.previousAmount,status:f.bids.status,createdAt:f.bids.createdAt,roomTitle:f.auctionRooms.title}).from(f.bids).leftJoin(f.auctionRooms,(0,g.eq)(f.bids.roomId,f.auctionRooms.id)).orderBy((0,h.i)(f.bids.createdAt)).limit(i);return d.NextResponse.json({success:!0,bids:j})}catch(a){return d.NextResponse.json({success:!1,error:a.message},{status:500})}}},74998:a=>{"use strict";a.exports=require("perf_hooks")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[380,319,170],()=>b(b.s=13917));module.exports=c})();