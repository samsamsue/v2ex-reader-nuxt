
const lockScrollList = reactive([])

function lockScroll(name) {
    if(!lockScrollList.includes(name)){
        lockScrollList.push(name)
    }
    document.documentElement.style.setProperty('--scrollbar-width', `${window.innerWidth - document.documentElement.clientWidth}px`)
    document.documentElement.classList.add('lock-scroll')
}

function unLockScroll(name) {
    const index = lockScrollList.indexOf(name)
    if(index!== -1){
        lockScrollList.splice(index, 1)
    }
    if(lockScrollList.length === 0){
        document.documentElement.classList.remove('lock-scroll')
    }
}

export { lockScroll, unLockScroll }
