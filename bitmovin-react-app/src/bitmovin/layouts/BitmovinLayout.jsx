
export const BitmovinLayout = ({children, title}) => {
  return (
    <>
    <h1>{title}</h1>
      <div>
        { children }
      </div>
    </>
  )
}
