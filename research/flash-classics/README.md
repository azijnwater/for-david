# Flash classics: reference recovery and reconstruction status

This records reference recovery and the modern Sucuk adaptations of all 54 requested games. Edition choices favor well-known Flash entries; no universal popularity ranking is asserted. These are playable, condensed cat adaptations, not verified exact recreations of the original games or their complete campaigns.

## Files recovered

- Twenty-three creator/publisher-hosted SWFs, covering 21 requested games plus Hapland 2 and 3 as additional series references. These include Kingdom Rush, GemCraft Labyrinth, Fancy Pants World 2, Sonny 2, Strike Force Heroes 2, Crush the Castle 2 and the initially recovered creator-hosted files. The complete file list and hashes are in files.json.
- Two Metanet tutorial source ZIPs for N's collision systems. These are tutorial sources, not the complete N game.
- 27 Canabalt HaxeFlixel source/config/license files at commit `a1f44cc39275474b644cea63b30a553c71f235fc`.
- `lr-core` 0.8.2 is pinned in the application lockfile. Its upstream and npm metadata declare MIT. Dependencies were installed without running lifecycle scripts. It is a compatibility engine, not an original Line Rider FLA.

[files.json](files.json) records URLs, download results, SHA-256 hashes, lengths, stage dimensions, frame rates and ActionScript version. [canabalt-source.json](canabalt-source.json) records individual source hashes. [pages.json](pages.json) records all 54 public-page scan results. [sources.json](sources.json) pins the source repositories inspected. [catalog.json](catalog.json) covers all 54 requests, selected editions, required mechanics, proposed Sucuk treatments and source findings.

The original binaries and archives stay in the ignored `.reference/flash-classics/` folder, outside `public/`. They are not website assets. The SWFs were parsed statically; successful parsing is not a successful gameplay test. No game binaries were executed, and no ZIP files were extracted. Re-run the metadata inspection with `python scripts/research_flash.py`.

## Implemented in this change

**Cushion Rider** uses the existing Line Rider compatibility engine with Sucuk rendering. The editor includes pencil/straight lines, solid/acceleration/scenery types, line-side flipping, erasing, a start flag, pan, zoom, undo/redo, 40 Hz playback, pause, rewind, frame stepping/scrubbing, device saves and bounded JSON import/export. The engine supplies the constrained rider, sled and collision simulation.

This is a source-based adaptation, not a verified bit-for-bit recreation of a particular historic SWF. Historic parity tests must run against a pinned original before claiming exact fidelity. Creative track building exports tracks rather than inventing a competitive score. The twelve existing scored minigames are preserved.

The other 53 requests now have original Sucuk games built with React, TypeScript and Canvas. Shared genre systems provide platform movement, wall jumps, tunnel running, run-and-gun combat, tower defense and pathfinding, army economy and orders, inventory adventures, a trick quiz, turn-based party combat, life progression, flight and mining, room shooters, ballistic duels, constrained ragdolls, a cat-craze simulation and a pizza kitchen. Variants select their own rules and cat scenarios. Content is deliberately condensed (for example, three platform chapters, eight defense waves, five RPG encounters and twenty quiz questions), rather than the historic level corpus.

Every game has its own direct page, including `/cushion-rider`; arcade cards are links, and there is no game dialog. The catalogue offers search, categories and pagination. The existing photo archive lightbox is unchanged. Original artwork uses Sucuk, Miso, Luna, Mochi and Pepper. No Flash player, SWF, Ruffle, original commercial art or original audio is shipped.

Club Sucuk is a solo town with NPCs, fishing and outfits. Transforcats and Platform Purracing offer local controls; racing also has a solo rival. They do not implement online rooms, accounts, synchronized physics, chat servers or player-made level hosting. Global score persistence still requires the project's private Vercel Blob store and `BLOB_READ_WRITE_TOKEN`; the UI reports unavailability when it is absent. Device bests and Cushion Rider tracks work independently.

## Source findings and remaining work

- **Canabalt:** [code](https://github.com/ninjamuffin99/canabalt-hf) is MIT; the separate [asset license](https://github.com/ninjamuffin99/canabalt-assets/blob/main/LICENSE.md) prohibits redistributing the original data. Replacement cat artwork/audio is required. Its variable jump duration, stumble slowdown, hallways, collapsing roofs, bombs and cranes are distinct systems. The existing generic Midnight zoomies game does not implement them all and is not renamed to Canabalt.
- **Platform Racing 2:** the creator publishes [client](https://github.com/jacob-grahn/platform-racing-2-client) and [server](https://github.com/jacob-grahn/platform-racing-2-server) code under MIT. The current Haxe/OpenFL client migration documents stub/unfinished screens. Its presence does not establish complete multiplayer gameplay. Art and music have separate terms.
- **Line Rider:** upstream/package metadata declare MIT. Some upstream historic compatibility fixtures are skipped; compatibility must not be overstated. [Line Rider Advanced](https://github.com/jealouscloud/linerider-advanced) uses GPL-3.0 and is a separate integration decision.
- **N:** official collision tutorial sources help with geometry. They do not include the complete game's enemy AI, level corpus or campaign/save logic.
- **Club Penguin, Transformice, Platform Racing 2 and SAS 3:** a SWF alone cannot supply accounts, authoritative rooms, lobbies, matchmaking, chat handling and backend persistence. The current stateless Vercel application does not implement those game servers.
- **Machinarium and The Binding of Isaac:** public demos are limited references, not the complete commercial games. No complete commercial builds were downloaded.
- **Newgrounds and Flashpoint:** some local page/API requests returned HTTP 403. Those failures were recorded; no access restrictions were bypassed.
- **Crimson Room:** the FASCO domain failed DNS. Its external safe-code dependency needs investigation against a preserved build.
- **QWOP:** the creator's current page loads a JavaScript/WebGL port, which is distinct from an original Flash SWF.
- **GROW RPG:** the creator page describes later revisions; the recovered AS3 binary should not be presented as an unmodified 2005 original.

Exact historical fidelity remains unverified for all 54. The original games' full maps, puzzle content, item/skill tables, boss fights, animation/audio and network infrastructure are not reproduced by these condensed adaptations. Achieving exact recreations would require the fidelity work below. Catalogue implementation entries intentionally retain `exactParityVerified: false`.

## Fidelity gate

1. Pin the version and reference-file hash. Distinguish loaders, demos, HTML5 ports and complete Flash games.
2. Inspect dependencies, saves, frame rate, controls, collision/movement constants, scoring, progression and completion.
3. Catalogue every target map/level, unit/enemy/item rule, puzzle state and campaign table. Preserve the game systems while replacing the character/art layer with Sucuk.
4. Compare recorded inputs and outcomes against the reference. Test trajectories for physics games, economy/combat tables for strategy/RPGs, and complete solution paths for adventures.
5. Verify restart, completion, keyboard/touch, persistence and browser errors. A title screen or simplified minigame does not establish full fidelity.
6. Publish the verified implementation and permitted assets with attribution and working persistence/network configuration.
